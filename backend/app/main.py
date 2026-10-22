import hashlib
import hmac
import json
import os
import secrets
import smtplib
import time
from collections import defaultdict,deque
from contextlib import asynccontextmanager
from email.message import EmailMessage
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4
from fastapi import FastAPI,Request,Response,HTTPException,Depends
from fastapi.responses import FileResponse,JSONResponse
from pydantic import BaseModel,Field,ValidationError
from . import database
from .application import RuleError,execute,state
from .schemas import Credentials,Action

@asynccontextmanager
async def lifespan(app):
    database.initialize()
    yield

app=FastAPI(title='Solo Leveling MVP',version='0.2.0',lifespan=lifespan)
DIST=Path(__file__).parents[2]/'dist'
attempts=defaultdict(deque)

def digest(value): return hashlib.sha256(value.encode()).hexdigest()

def hash_password(value,salt=None):
    salt=salt or secrets.token_hex(16)
    return salt+':'+hashlib.pbkdf2_hmac('sha256',value.encode(),salt.encode(),600000).hex()

def check_password(value,encoded):
    return hmac.compare_digest(hash_password(value,encoded.split(':')[0]),encoded)

def rate_limit(request:Request):
    key=(request.client.host if request.client else 'local',request.url.path)
    now=time.time()
    q=attempts[key]
    while q and q[0]<now-60: q.popleft()
    if len(q)>=15: raise HTTPException(429,'Thử lại sau một phút.')
    q.append(now)

@app.middleware('http')
async def headers_and_origin(request,call_next):
    origin=request.headers.get('origin')
    expected=f'{request.url.scheme}://{request.url.netloc}'
    allowed={expected,*os.getenv('SOLO_ALLOWED_ORIGINS','http://127.0.0.1:4200,http://localhost:4200').split(',')}
    if request.method not in ('GET','HEAD','OPTIONS') and origin and origin not in allowed:
        return JSONResponse({'detail':'Nguồn yêu cầu không được phép.'},status_code=403)
    result=await call_next(request)
    result.headers['X-Content-Type-Options']='nosniff'
    result.headers['Referrer-Policy']='same-origin'
    result.headers['X-Frame-Options']='DENY'
    if request.url.path.startswith('/api') or request.url.path=='/runtime-config.js': result.headers['Cache-Control']='no-store'
    return result

@app.exception_handler(RuleError)
async def rule_error(request,error):
    return JSONResponse({'detail':error.message},status_code=error.code)

@app.exception_handler(ValidationError)
async def validation_error(request,error):
    return JSONResponse({'detail':'Dữ liệu không hợp lệ. Kiểm tra tên, thời lượng và thời gian.'},status_code=422)

def current_user(request:Request):
    token=request.cookies.get('solo_session','')
    with database.connection() as db:
        row=db.execute('SELECT user_id FROM auth_sessions WHERE token_hash=? AND expires>?',(digest(token),time.time())).fetchone()
    if not row: raise HTTPException(401,'Vui lòng đăng nhập.')
    return row['user_id']

def set_session(response,user_id,request):
    token=secrets.token_urlsafe(48)
    with database.connection() as db:
        db.execute('INSERT INTO auth_sessions VALUES(?,?,?)',(digest(token),user_id,time.time()+604800))
    response.set_cookie('solo_session',token,max_age=604800,httponly=True,secure=request.url.scheme=='https',samesite='strict',path='/')

@app.get('/api/v1/health')
def health():
    with database.connection() as db: db.execute('SELECT 1')
    return {'status':'ok','version':'0.2.0'}

@app.post('/api/v1/auth/signup',dependencies=[Depends(rate_limit)])
def signup(data:Credentials,request:Request,response:Response):
    user_id=str(uuid4())
    profile={'name':data.name.strip(),'timezone':'Asia/Ho_Chi_Minh','goals':[],
             'activeStart':'08:00','activeEnd':'22:00','rests':[{'start':'12:00','end':'13:00'}],
             'calendarEnabled':True,'reminders':False,'reminderLimit':3,
             'protection':{'enabled':False,'breakInterval':50},'onboarding':False}
    if not profile['name']: raise HTTPException(422,'Vui lòng nhập tên.')
    with database.transaction() as db:
        if db.execute('SELECT id FROM users WHERE email=?',(data.email.lower().strip(),)).fetchone(): raise HTTPException(409,'Không thể tạo tài khoản với email này. Hãy đăng nhập hoặc đặt lại mật khẩu.')
        db.execute('INSERT INTO users VALUES(?,?,?,?,0)',(user_id,data.email.lower().strip(),hash_password(data.password),json.dumps(profile)))
    set_session(response,user_id,request)
    with database.connection() as db: return state(db,user_id)

@app.post('/api/v1/auth/login',dependencies=[Depends(rate_limit)])
def login(data:Credentials,request:Request,response:Response):
    with database.connection() as db:
        row=db.execute('SELECT * FROM users WHERE email=?',(data.email.lower().strip(),)).fetchone()
        encoded=row['password'] if row else hash_password('dummy-password')
        valid=check_password(data.password,encoded)
        if not row or not valid: raise HTTPException(401,'Email hoặc mật khẩu chưa đúng.')
        user_id=row['id']
    set_session(response,user_id,request)
    with database.connection() as db: return state(db,user_id)

@app.post('/api/v1/auth/logout')
def logout(request:Request,response:Response):
    with database.connection() as db: db.execute('DELETE FROM auth_sessions WHERE token_hash=?',(digest(request.cookies.get('solo_session','')),))
    response.delete_cookie('solo_session',path='/')
    return {'ok':True}

class EmailRequest(BaseModel):
    email: str=Field(max_length=254,pattern=r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

@app.post('/api/v1/auth/forgot',dependencies=[Depends(rate_limit)])
def forgot(data:EmailRequest):
    host=os.getenv('SMTP_HOST')
    public_url=os.getenv('SOLO_PUBLIC_URL')
    if not host or not public_url: raise HTTPException(503,'Email đặt lại mật khẩu chưa được cấu hình. Liên hệ người quản trị.')
    with database.connection() as db:
        user=db.execute('SELECT id FROM users WHERE email=?',(data.email.lower().strip(),)).fetchone()
        if user:
            token=secrets.token_urlsafe(48)
            db.execute('INSERT INTO resets VALUES(?,?,?)',(digest(token),user['id'],time.time()+1800))
            message=EmailMessage()
            message['Subject']='Solo Leveling — Đặt lại mật khẩu'
            message['From']=os.getenv('SMTP_FROM','no-reply@example.com')
            message['To']=data.email
            message.set_content(f"Mở liên kết sau trong 30 phút để đặt lại mật khẩu: {public_url.rstrip('/')}/reset-password?token={token}\nNếu không yêu cầu, bạn có thể bỏ qua email này.")
            try:
                with smtplib.SMTP(host,int(os.getenv('SMTP_PORT','587')),timeout=10) as smtp:
                    smtp.starttls()
                    if os.getenv('SMTP_USER'): smtp.login(os.environ['SMTP_USER'],os.environ['SMTP_PASSWORD'])
                    smtp.send_message(message)
            except Exception:
                # Same neutral response for registered and unregistered addresses.
                pass
    return {'message':'Nếu email hợp lệ, hướng dẫn sẽ được gửi đến hộp thư của bạn.'}

class ResetRequest(BaseModel):
    token:str=Field(min_length=20,max_length=200)
    password:str=Field(min_length=10,max_length=128)

@app.post('/api/v1/auth/reset',dependencies=[Depends(rate_limit)])
def reset(data:ResetRequest):
    with database.transaction() as db:
        row=db.execute('SELECT * FROM resets WHERE token_hash=? AND expires>?',(digest(data.token),time.time())).fetchone()
        if not row: raise HTTPException(400,'Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu lại.')
        db.execute('UPDATE users SET password=? WHERE id=?',(hash_password(data.password),row['user_id']))
        db.execute('DELETE FROM resets WHERE user_id=?',(row['user_id'],))
        db.execute('DELETE FROM auth_sessions WHERE user_id=?',(row['user_id'],))
    return {'ok':True}

@app.get('/api/v1/state')
def get_state(user_id=Depends(current_user)):
    with database.connection() as db: return state(db,user_id)

@app.post('/api/v1/actions')
def actions(action:Action,user_id=Depends(current_user)):
    return execute(user_id,action)

class DeleteRequest(BaseModel):
    confirmation: str

@app.post('/api/v1/auth/delete')
def delete_account(data:DeleteRequest,response:Response,user_id=Depends(current_user)):
    if data.confirmation!='XÓA': raise HTTPException(400,'Nhập XÓA để xác nhận.')
    with database.transaction() as db: db.execute('DELETE FROM users WHERE id=?',(user_id,))
    response.delete_cookie('solo_session',path='/')
    return {'ok':True}

@app.get('/runtime-config.js')
def runtime_config():
    return Response("window.SOLO_CONFIG={mode:'server',api:'/api/v1'};",media_type='text/javascript')

@app.get('/{path:path}',include_in_schema=False)
def frontend(path:str):
    if path.startswith('api/'): raise HTTPException(404,'Không tìm thấy API.')
    candidate=(DIST/path).resolve()
    if candidate.is_relative_to(DIST.resolve()) and candidate.is_file(): return FileResponse(candidate)
    if (DIST/'index.html').is_file(): return FileResponse(DIST/'index.html')
    raise HTTPException(404,'Chưa build frontend. Chạy npm run build trước.')
