from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from backend.app import database
from backend.app.main import app,attempts
from backend.app.domain import available_windows,level_for,utc_now

@pytest.fixture
def client(tmp_path,monkeypatch):
    attempts.clear()
    monkeypatch.setattr(database,'DB_PATH',tmp_path/'test.db')
    with TestClient(app) as c:
        yield c

def signup(c,email='long@example.com'):
    r=c.post('/api/v1/auth/signup',json={'email':email,'password':'sample-password-123','name':'Gia Long'})
    assert r.status_code==200,r.text
    return r.json()

def get(c): return c.get('/api/v1/state').json()

def action(c,kind,data,mid=None,revision=None):
    return c.post('/api/v1/actions',json={'kind':kind,'data':data,'mutationId':mid or str(uuid4()),'revision':get(c)['revision'] if revision is None else revision})

def quest(c):
    r=action(c,'quest.save',{'title':'Đọc 10 trang','description':'Đọc sách','duration':10,'date':'2026-10-11','goal':'Cá nhân'})
    assert r.status_code==200,r.text
    return r.json()['quests'][-1]

def test_rules():
    assert level_for(1340)=={'level':7,'current':140,'next':200}
    assert available_windows(840,960,[(840,900),(930,960)],[])==[(905,925)]
    assert available_windows(840,960,[(840,900),(930,960)],[(900,930)])==[]

def test_goal_crud_linkage_priority_archive_and_restore(client):
    signup(client)
    created=action(client,'goal.save',{'title':'Học tiếng Anh','description':'Duy trì 15 phút mỗi ngày.'})
    assert created.status_code==200,created.text
    goal=created.json()['goals'][0]
    assert goal['priority']=='normal' and goal['status']=='active' and goal['description']=='Duy trì 15 phút mỗi ngày.'

    linked=action(client,'quest.save',{'title':'Ôn 5 từ mới','duration':10,'date':'2026-10-11','goal':'Cá nhân','goalId':goal['id']})
    assert linked.status_code==200,linked.text
    q=linked.json()['quests'][0]
    assert q['goalId']==goal['id'] and q['goal']=='Cá nhân'

    priority=action(client,'goal.priority',{'id':goal['id'],'priority':'high'})
    assert priority.status_code==200 and priority.json()['goals'][0]['priority']=='high'
    archived=action(client,'goal.archive',{'id':goal['id'],'archived':True})
    assert archived.status_code==200 and archived.json()['goals'][0]['status']=='archived'
    assert archived.json()['quests'][0]['goalId']==goal['id']
    assert action(client,'quest.save',{'title':'Nhiệm vụ mới','duration':10,'date':'2026-10-11','goalId':goal['id']}).status_code==400
    completed=action(client,'quest.complete',{'id':q['id']})
    assert completed.status_code==200 and completed.json()['xp']==20
    restored=action(client,'goal.archive',{'id':goal['id'],'archived':False})
    assert restored.status_code==200 and restored.json()['goals'][0]['status']=='active'

def test_goal_records_are_user_scoped(client):
    signup(client);goal=action(client,'goal.save',{'title':'Riêng tư'}).json()['goals'][0]
    client.post('/api/v1/auth/logout');signup(client,'other@example.com')
    assert action(client,'goal.archive',{'id':goal['id']}).status_code==404
    assert get(client)['goals']==[]

def test_database_migration_adds_goal_link_without_changing_existing_quest(tmp_path,monkeypatch):
    path=tmp_path/'legacy.db';monkeypatch.setattr(database,'DB_PATH',path)
    with database.connection() as db:
        db.execute('CREATE TABLE users(id TEXT PRIMARY KEY)')
        db.execute('INSERT INTO users VALUES(?)',('user-1',))
        db.execute('CREATE TABLE quests(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,description TEXT NOT NULL,duration INTEGER NOT NULL,goal TEXT NOT NULL,date TEXT NOT NULL,timezone TEXT NOT NULL,status TEXT NOT NULL,completed_at TEXT)')
        db.execute("INSERT INTO quests VALUES('quest-1','user-1','Đọc sách','Ghi chú',10,'Học tập','2026-10-11','Asia/Ho_Chi_Minh','pending',NULL)")
    database.initialize()
    with database.connection() as db:
        row=db.execute('SELECT id,title,goal_id FROM quests').fetchone()
        assert tuple(row)==('quest-1','Đọc sách',None)
        assert db.execute('PRAGMA user_version').fetchone()[0]==3

def test_signup_is_empty_and_password_not_exposed(client):
    s=signup(client)
    assert s['xp']==0 and s['quests']==[] and not s['profile']['onboarding']
    assert s['profile']['protection']=={'enabled':False,'breakInterval':50}
    assert 'password' not in str(s)
    with database.connection() as db:
        stored=db.execute('SELECT password FROM users').fetchone()[0]
    assert 'sample-password' not in stored

def test_complete_retry_double_click_and_undo(client):
    signup(client);q=quest(client);mid=str(uuid4())
    first=action(client,'quest.complete',{'id':q['id']},mid)
    second=action(client,'quest.complete',{'id':q['id']},mid)
    assert first.status_code==second.status_code==200
    assert first.json()==second.json()
    assert action(client,'quest.complete',{'id':q['id']}).json()['xp']==20
    undo_id=str(uuid4())
    assert action(client,'quest.undo',{'id':q['id']},undo_id).json()['xp']==0
    assert action(client,'quest.undo',{'id':q['id']},undo_id).json()['xp']==0
    s=action(client,'quest.complete',{'id':q['id']}).json()
    assert s['xp']==20 and len(s['ledger'])==3

def test_concurrent_completions_issue_xp_once(client):
    signup(client);q=quest(client)
    from backend.app.application import execute
    from backend.app.schemas import Action
    with database.connection() as db:user_id=db.execute('SELECT id FROM users').fetchone()[0]
    def complete(_):return execute(user_id,Action(kind='quest.complete',data={'id':q['id']},mutationId=str(uuid4()),revision=0))
    with ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(complete,range(4)))
    assert all(s['xp']==20 for s in results)
    assert len(get(client)['ledger'])==1

def test_undo_expiry(client):
    signup(client);q=quest(client);action(client,'quest.complete',{'id':q['id']})
    with database.connection() as db:db.execute('UPDATE quests SET completed_at=? WHERE id=?',((utc_now()-timedelta(minutes=11)).isoformat(),q['id']))
    assert action(client,'quest.undo',{'id':q['id']}).status_code==400
    assert get(client)['xp']==20

def test_completed_duration_immutable_and_archive_keeps_xp(client):
    signup(client);q=quest(client);action(client,'quest.complete',{'id':q['id']})
    assert action(client,'quest.save',q|{'duration':20}).status_code==400
    assert action(client,'quest.archive',{'id':q['id']}).json()['xp']==20

def test_only_one_focus_and_early_end_does_not_complete(client):
    signup(client);q=quest(client)
    r=action(client,'focus.start',{'questId':q['id']})
    assert r.status_code==200,r.text
    session=r.json()['sessions'][-1]
    assert action(client,'focus.start',{'questId':q['id']}).status_code==409
    s=action(client,'focus.end',{'id':session['id']}).json()
    assert s['xp']==0 and s['quests'][0]['status']=='pending' and s['sessions'][0]['status']=='ended_early'

def test_timer_elapsed_does_not_grant_xp(client):
    signup(client);q=quest(client);action(client,'focus.start',{'questId':q['id']})
    with database.connection() as db:db.execute('UPDATE focus_sessions SET target_end=?',((utc_now()-timedelta(seconds=2)).isoformat(),))
    s=get(client)
    assert s['sessions'][0]['status']=='completed' and s['xp']==0 and s['quests'][0]['status']=='pending'

def test_validation_and_conflicting_block(client):
    signup(client)
    b={'title':'Học','start':'2026-10-11T06:00:00Z','end':'2026-10-11T07:00:00Z','type':'busy','focus':False}
    assert action(client,'block.save',b|{'end':b['start']}).status_code==400
    assert action(client,'block.save',b).status_code==200
    assert action(client,'block.save',b).status_code==409
    assert action(client,'block.save',b|{'acceptConflict':True}).status_code==200
    assert action(client,'quest.save',{'title':'','duration':0,'date':'invalid'}).status_code==422

def test_schedule_has_buffer_and_keeps_quest_after_delete(client):
    signup(client);q=quest(client)
    action(client,'block.save',{'title':'Học','start':'2026-10-11T06:00:00Z','end':'2026-10-11T07:00:00Z','type':'busy'})
    b={'title':q['title'],'start':'2026-10-11T07:00:00Z','end':'2026-10-11T07:10:00Z','type':'busy','focus':True,'questId':q['id']}
    assert action(client,'block.save',b).status_code==400
    r=action(client,'block.save',b|{'start':'2026-10-11T07:05:00Z','end':'2026-10-11T07:15:00Z'})
    assert r.status_code==200,r.text
    block=r.json()['blocks'][-1]
    s=action(client,'block.delete',{'id':block['id']}).json()
    assert len(s['quests'])==1 and s['xp']==0

def test_users_cannot_access_others_records(client):
    signup(client);q=quest(client)
    client.post('/api/v1/auth/logout')
    signup(client,'other@example.com')
    assert action(client,'quest.complete',{'id':q['id']}).status_code==404
    assert get(client)['quests']==[]

def test_stale_edit_rejected(client):
    signup(client);revision=get(client)['revision'];q=quest(client)
    assert action(client,'quest.save',q|{'title':'Tên khác'},revision=revision).status_code==409

def test_voluntary_protection_syncs_preferences_but_not_selected_apps(client):
    signup(client)
    profile=get(client)['profile']
    profile['protection']={'enabled':True,'breakInterval':45}
    profile['selectedApps']=['com.instagram.android']
    saved=action(client,'profile.save',profile)
    assert saved.status_code==200,saved.text
    assert saved.json()['profile']['protection']=={'enabled':True,'breakInterval':45}
    assert 'selectedApps' not in saved.json()['profile']
    profile['protection']={'enabled':True,'breakInterval':17}
    assert action(client,'profile.save',profile).status_code==422

def test_quick_action_accepts_two_minutes_and_never_grants_xp(client):
    signup(client);q=quest(client)
    started=action(client,'quick.start',{'title':'Đọc một đoạn','goal':'Học tập','questId':q['id'],'duration':2})
    assert started.status_code==200,started.text
    session=started.json()['quickSessions'][0]
    assert session['duration']==2 and session['status']=='active' and started.json()['xp']==0
    assert action(client,'quick.start',{'title':'Việc khác','duration':5}).status_code==409
    with database.connection() as db:db.execute('UPDATE quick_sessions SET target_end=? WHERE id=?',((utc_now()-timedelta(seconds=1)).isoformat(),session['id']))
    elapsed=get(client)
    assert elapsed['quickSessions'][0]['status']=='elapsed' and elapsed['xp']==0
    finished=action(client,'quick.finish',{'id':session['id'],'outcome':'unfinished'})
    assert finished.status_code==200 and finished.json()['xp']==0
    assert finished.json()['quests'][0]['status']=='pending'
    assert finished.json()['quickSessions'][0]['outcome']=='unfinished'

def test_logout_and_delete(client):
    signup(client);quest(client)
    assert client.post('/api/v1/auth/delete',json={'confirmation':'wrong'}).status_code==400
    assert client.post('/api/v1/auth/delete',json={'confirmation':'XÓA'}).status_code==200
    assert client.get('/api/v1/state').status_code==401
    with database.connection() as db:
        assert db.execute('SELECT COUNT(*) FROM users').fetchone()[0]==0
        assert db.execute('SELECT COUNT(*) FROM quests').fetchone()[0]==0

def test_origin_protection_and_forgot_requires_smtp(client,monkeypatch):
    signup(client)
    assert client.post('/api/v1/auth/logout',headers={'origin':'https://evil.example'}).status_code==403
    monkeypatch.delenv('SMTP_HOST',raising=False)
    assert client.post('/api/v1/auth/forgot',json={'email':'any@example.com'}).status_code==503
