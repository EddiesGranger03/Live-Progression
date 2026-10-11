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

def test_signup_is_empty_and_password_not_exposed(client):
    s=signup(client)
    assert s['xp']==0 and s['quests']==[] and not s['profile']['onboarding']
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
