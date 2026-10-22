import json
from datetime import timedelta
from uuid import uuid4
from zoneinfo import ZoneInfo
from . import database
from .domain import utc_now,parse_time,overlaps,XP_PER_QUEST,UNDO_SECONDS
from .schemas import QuestWrite,GoalWrite,GoalPriority,GoalArchive,BlockWrite,ProfileWrite,QuickActionStart,QuickActionFinish,Action

class RuleError(Exception):
    def __init__(self,message,code=400):
        self.message,self.code=message,code

def owned(db,table,user_id,item_id):
    row=db.execute(f'SELECT * FROM {table} WHERE id=? AND user_id=?',(item_id,user_id)).fetchone()
    if not row: raise RuleError('Không tìm thấy dữ liệu.',404)
    return dict(row)

def settle_sessions(db,user_id):
    now=utc_now().isoformat()
    db.execute("UPDATE focus_sessions SET status='completed',actual_end=target_end WHERE user_id=? AND status='active' AND target_end<=?",(user_id,now))

def settle_quick_sessions(db,user_id):
    now=utc_now().isoformat()
    db.execute("UPDATE quick_sessions SET status='elapsed',actual_end=target_end WHERE user_id=? AND status='active' AND target_end<=?",(user_id,now))

def state(db,user_id):
    settle_sessions(db,user_id)
    settle_quick_sessions(db,user_id)
    user=db.execute('SELECT * FROM users WHERE id=?',(user_id,)).fetchone()
    if not user: raise RuleError('Phiên đăng nhập đã kết thúc.',401)
    profile=json.loads(user['profile'])|{'email':user['email']}
    profile.setdefault('protection',{'enabled':False,'breakInterval':50})
    goals=[dict(r) for r in db.execute('SELECT * FROM goals WHERE user_id=? ORDER BY rowid',(user_id,))]
    quests=[dict(r) for r in db.execute('SELECT * FROM quests WHERE user_id=? ORDER BY rowid',(user_id,))]
    blocks=[dict(r) for r in db.execute('SELECT * FROM blocks WHERE user_id=? ORDER BY start',(user_id,))]
    sessions=[dict(r) for r in db.execute('SELECT * FROM focus_sessions WHERE user_id=? ORDER BY start',(user_id,))]
    quick_sessions=[dict(r) for r in db.execute('SELECT * FROM quick_sessions WHERE user_id=? ORDER BY start',(user_id,))]
    ledger=[dict(r) for r in db.execute('SELECT * FROM ledger WHERE user_id=? ORDER BY created_at',(user_id,))]
    def camel(row):
        mapping={'quest_id':'questId','goal_id':'goalId','completed_at':'completedAt','block_id':'blockId','target_end':'targetEnd','actual_end':'actualEnd','created_at':'createdAt','local_date':'localDate'}
        return {mapping.get(k,k):v for k,v in row.items() if k!='user_id'}
    return {'profile':profile,'goals':list(map(camel,goals)),'quests':list(map(camel,quests)),'blocks':list(map(camel,blocks)),
            'sessions':list(map(camel,sessions)),'quickSessions':list(map(camel,quick_sessions)),'ledger':list(map(camel,ledger)),
            'xp':max(0,sum(r['amount'] for r in ledger)),'revision':user['revision']}

def execute(user_id,action:Action):
    with database.transaction() as db:
        saved=db.execute('SELECT result FROM mutations WHERE user_id=? AND id=?',(user_id,action.mutationId)).fetchone()
        if saved: return json.loads(saved['result'])
        current=state(db,user_id)
        kind,d=action.kind,action.data
        if kind not in ('quest.complete','quest.undo','focus.start','focus.end') and action.revision!=current['revision']:
            raise RuleError('Dữ liệu đã thay đổi. Vui lòng xem bản mới rồi lưu lại.',409)
        now=utc_now()
        profile=current['profile']
        if kind=='goal.save':
            goal=GoalWrite.model_validate(d)
            if goal.id:
                owned(db,'goals',user_id,goal.id)
                db.execute('UPDATE goals SET title=?,description=? WHERE id=?',(goal.title,goal.description,goal.id))
            else:
                db.execute('INSERT INTO goals(id,user_id,title,description,priority,status,created_at) VALUES(?,?,?,?,?,?,?)',
                           (str(uuid4()),user_id,goal.title,goal.description,'normal','active',now.isoformat()))
        elif kind=='goal.priority':
            priority=GoalPriority.model_validate(d)
            owned(db,'goals',user_id,priority.id)
            db.execute('UPDATE goals SET priority=? WHERE id=?',(priority.priority,priority.id))
        elif kind=='goal.archive':
            goal=GoalArchive.model_validate(d)
            owned(db,'goals',user_id,goal.id)
            db.execute('UPDATE goals SET status=? WHERE id=?',('archived' if goal.archived else 'active',goal.id))
        elif kind=='quest.save':
            q=QuestWrite.model_validate(d)
            if q.goal!='Cá nhân' and q.goal not in profile['goals']: raise RuleError('Chọn một mục tiêu trong hồ sơ của bạn.')
            if q.id: old=owned(db,'quests',user_id,q.id)
            else: old=None
            if q.goalId:
                linked_goal=owned(db,'goals',user_id,q.goalId)
                if linked_goal['status']=='archived' and (old is None or old['goal_id']!=q.goalId):
                    raise RuleError('Không thể liên kết nhiệm vụ mới với mục tiêu đã lưu trữ.')
            if q.id:
                if old['status']=='completed' and (q.duration!=old['duration'] or str(q.date)!=old['date'] or q.goal!=old['goal'] or q.goalId!=old['goal_id']):
                    raise RuleError('Nhiệm vụ đã hoàn thành chỉ sửa tên và ghi chú.')
                db.execute('UPDATE quests SET title=?,description=?,duration=?,goal=?,date=?,goal_id=? WHERE id=?',(q.title,q.description,q.duration,q.goal,str(q.date),q.goalId,q.id))
            else:
                db.execute('INSERT INTO quests(id,user_id,title,description,duration,goal,date,timezone,status,completed_at,goal_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                           (str(uuid4()),user_id,q.title,q.description,q.duration,q.goal,str(q.date),profile['timezone'],'pending',None,q.goalId))
        elif kind in ('quest.complete','quest.undo','quest.archive'):
            q=owned(db,'quests',user_id,d.get('id'))
            if kind=='quest.complete':
                if q['status']=='archived': raise RuleError('Nhiệm vụ đã lưu trữ.')
                if q['status']!='completed':
                    db.execute("UPDATE quests SET status='completed',completed_at=? WHERE id=?",(now.isoformat(),q['id']))
                    db.execute('INSERT INTO ledger VALUES(?,?,?,?,?,?,?,?,?,?)',(str(uuid4()),user_id,q['id'],action.mutationId,XP_PER_QUEST,'completion',now.isoformat(),now.astimezone(ZoneInfo(profile['timezone'])).date().isoformat(),profile['timezone'],1))
            elif kind=='quest.undo':
                if q['status']=='completed':
                    if (now-parse_time(q['completed_at'])).total_seconds()>UNDO_SECONDS: raise RuleError('Đã hết thời gian hoàn tác 10 phút.')
                    last=db.execute("SELECT * FROM ledger WHERE quest_id=? AND reason='completion' ORDER BY created_at DESC LIMIT 1",(q['id'],)).fetchone()
                    db.execute("UPDATE quests SET status='pending',completed_at=NULL WHERE id=?",(q['id'],))
                    db.execute('INSERT INTO ledger VALUES(?,?,?,?,?,?,?,?,?,?)',(str(uuid4()),user_id,q['id'],action.mutationId,-XP_PER_QUEST,'undo',now.isoformat(),last['local_date'],last['timezone'],1))
            else:
                db.execute("UPDATE quests SET status='archived' WHERE id=?",(q['id'],))
        elif kind=='block.save':
            b=BlockWrite.model_validate(d)
            start,end=parse_time(b.start),parse_time(b.end)
            if end<=start: raise RuleError('Giờ kết thúc phải sau giờ bắt đầu.')
            if not b.title.strip(): raise RuleError('Vui lòng nhập tên khung giờ.')
            if (end-start).total_seconds()>86400: raise RuleError('Mỗi khung giờ dài tối đa 24 giờ.')
            if b.id: owned(db,'blocks',user_id,b.id)
            conflict=any(x['id']!=b.id and overlaps(start,end,parse_time(x['start']),parse_time(x['end'])) for x in current['blocks'])
            if conflict and (b.questId or not b.acceptConflict): raise RuleError('Khung giờ bị trùng với lịch đã có.',409)
            if b.questId:
                q=owned(db,'quests',user_id,b.questId)
                if q['status']!='pending': raise RuleError('Chỉ đặt lịch nhiệm vụ chưa hoàn thành.')
                if any(x['questId']==q['id'] and x['id']!=b.id for x in current['blocks']): raise RuleError('Nhiệm vụ đã có lịch thực hiện.')
                local=start.astimezone(ZoneInfo(profile['timezone']))
                local_end=end.astimezone(ZoneInfo(profile['timezone']))
                if local.date()!=local_end.date() or local.strftime('%H:%M')<profile['activeStart'] or local_end.strftime('%H:%M')>profile['activeEnd']:
                    raise RuleError('Chọn thời gian trong giờ hoạt động.')
                for r in profile['rests']:
                    if overlaps(local.strftime('%H:%M'),local_end.strftime('%H:%M'),r['start'],r['end']): raise RuleError('Khung này thuộc giờ nghỉ của bạn.')
                if (end-start).total_seconds()!=q['duration']*60: raise RuleError('Thời lượng phải khớp với nhiệm vụ.')
                for x in current['blocks']:
                    if x['id']!=b.id and overlaps(start,end,parse_time(x['start'])-timedelta(minutes=5),parse_time(x['end'])+timedelta(minutes=5)):
                        raise RuleError('Cần giữ đệm 5 phút giữa nhiệm vụ và lịch đã có.')
            values=(b.title.strip(),start.isoformat(),end.isoformat(),b.type,int(b.focus and b.type=='busy'),b.questId)
            if b.id: db.execute('UPDATE blocks SET title=?,start=?,end=?,type=?,focus=?,quest_id=? WHERE id=?',(*values,b.id))
            else: db.execute('INSERT INTO blocks VALUES(?,?,?,?,?,?,?,?)',(str(uuid4()),user_id,*values))
        elif kind=='block.delete':
            b=owned(db,'blocks',user_id,d.get('id'))
            db.execute('DELETE FROM blocks WHERE id=?',(b['id'],))
        elif kind=='focus.start':
            active=next((s for s in current['sessions'] if s['status']=='active'),None)
            if active: raise RuleError('Bạn đang có một phiên Focus. Hãy tiếp tục phiên đó.',409)
            quest_id,block_id=d.get('questId'),d.get('blockId')
            if quest_id:
                q=owned(db,'quests',user_id,quest_id)
                if q['status']!='pending': raise RuleError('Nhiệm vụ này không còn chờ thực hiện.')
                title,duration=q['title'],q['duration']
            elif block_id:
                b=owned(db,'blocks',user_id,block_id)
                if not b['focus'] or b['type']=='rest': raise RuleError('Khung này không bật Focus.')
                if not (parse_time(b['start'])<=now<parse_time(b['end'])): raise RuleError('Khung Focus chưa bắt đầu hoặc đã kết thúc.')
                duration=min(120,(parse_time(b['end'])-now).total_seconds()/60)
                title=b['title']
                quest_id=b['quest_id']
            else: raise RuleError('Chọn nhiệm vụ hoặc khung Focus.')
            if duration<5: raise RuleError('Còn dưới 5 phút. Hãy chọn một nhiệm vụ để bắt đầu phiên tay.')
            db.execute('INSERT INTO focus_sessions VALUES(?,?,?,?,?,?,?,?,?,?)',(str(uuid4()),user_id,title,quest_id,block_id,now.isoformat(),(now+timedelta(minutes=duration)).isoformat(),None,'active',profile['timezone']))
        elif kind=='focus.end':
            session=owned(db,'focus_sessions',user_id,d.get('id'))
            if session['status']=='active': db.execute("UPDATE focus_sessions SET status='ended_early',actual_end=? WHERE id=?",(now.isoformat(),session['id']))
        elif kind=='quick.start':
            quick=QuickActionStart.model_validate(d)
            if any(x['status']=='active' for x in current['sessions']): raise RuleError('Hãy kết thúc hoặc tiếp tục phiên Focus trước khi bắt đầu việc ngắn.',409)
            if any(x['status'] in ('active','elapsed') for x in current['quickSessions']): raise RuleError('Hãy xác nhận kết quả việc ngắn đang mở trước.',409)
            if quick.questId:
                q=owned(db,'quests',user_id,quick.questId)
                if q['status']!='pending': raise RuleError('Chỉ gắn việc ngắn với nhiệm vụ đang chờ.')
            start=now
            db.execute('INSERT INTO quick_sessions(id,user_id,title,goal,quest_id,duration,start,target_end,actual_end,status,outcome) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                       (str(uuid4()),user_id,quick.title,quick.goal,quick.questId,quick.duration,start.isoformat(),(start+timedelta(minutes=quick.duration)).isoformat(),None,'active',None))
        elif kind=='quick.finish':
            quick=QuickActionFinish.model_validate(d)
            session=owned(db,'quick_sessions',user_id,quick.id)
            if session['status'] not in ('active','elapsed'): raise RuleError('Việc ngắn này đã được xác nhận.')
            db.execute("UPDATE quick_sessions SET status='ended',actual_end=?,outcome=? WHERE id=?",(now.isoformat(),quick.outcome,session['id']))
        elif kind=='profile.save':
            p=ProfileWrite.model_validate(d)
            db.execute('UPDATE users SET profile=? WHERE id=?',(p.model_dump_json(),user_id))
        db.execute('UPDATE users SET revision=revision+1 WHERE id=?',(user_id,))
        result=state(db,user_id)
        db.execute('INSERT INTO mutations VALUES(?,?,?)',(user_id,action.mutationId,json.dumps(result)))
        return result
