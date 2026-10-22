import os
import sqlite3
from pathlib import Path
from contextlib import contextmanager

DB_PATH = Path(os.getenv('SOLO_DB_PATH', Path(__file__).parents[2] / 'data' / 'solo.db'))

SCHEMA = '''
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,profile TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS auth_sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires REAL NOT NULL);
CREATE TABLE IF NOT EXISTS resets(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires REAL NOT NULL);
CREATE TABLE IF NOT EXISTS goals(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,description TEXT NOT NULL,priority TEXT NOT NULL DEFAULT 'normal',status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quests(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,description TEXT NOT NULL,duration INTEGER NOT NULL,goal TEXT NOT NULL,date TEXT NOT NULL,timezone TEXT NOT NULL,status TEXT NOT NULL,completed_at TEXT,goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS blocks(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL,type TEXT NOT NULL,focus INTEGER NOT NULL,quest_id TEXT REFERENCES quests(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS focus_sessions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,quest_id TEXT REFERENCES quests(id) ON DELETE SET NULL,block_id TEXT,start TEXT NOT NULL,target_end TEXT NOT NULL,actual_end TEXT,status TEXT NOT NULL,timezone TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_session ON focus_sessions(user_id) WHERE status='active';
CREATE TABLE IF NOT EXISTS quick_sessions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,goal TEXT NOT NULL,quest_id TEXT REFERENCES quests(id) ON DELETE SET NULL,duration INTEGER NOT NULL,start TEXT NOT NULL,target_end TEXT NOT NULL,actual_end TEXT,status TEXT NOT NULL,outcome TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS one_open_quick_session ON quick_sessions(user_id) WHERE status IN ('active','elapsed');
CREATE INDEX IF NOT EXISTS quick_sessions_user_start ON quick_sessions(user_id,start);
CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,quest_id TEXT NOT NULL REFERENCES quests(id) ON DELETE CASCADE,mutation_id TEXT NOT NULL,amount INTEGER NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL,local_date TEXT NOT NULL,timezone TEXT NOT NULL,xp_rule_version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS mutations(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,id TEXT NOT NULL,result TEXT NOT NULL,PRIMARY KEY(user_id,id));
CREATE INDEX IF NOT EXISTS quests_user_date ON quests(user_id,date);
CREATE INDEX IF NOT EXISTS goals_user_status ON goals(user_id,status,priority);
CREATE INDEX IF NOT EXISTS blocks_user_start ON blocks(user_id,start);
CREATE INDEX IF NOT EXISTS ledger_user ON ledger(user_id,created_at);
'''

def initialize():
    DB_PATH.parent.mkdir(parents=True,exist_ok=True)
    with connection() as db:
        db.execute('PRAGMA journal_mode=WAL')
        db.executescript(SCHEMA)
        # Additive migration for databases created before independent goals existed.
        quest_columns={row['name'] for row in db.execute('PRAGMA table_info(quests)')}
        if 'goal_id' not in quest_columns:
            db.execute('ALTER TABLE quests ADD COLUMN goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL')
        db.execute('CREATE INDEX IF NOT EXISTS quests_goal ON quests(user_id,goal_id)')
        db.execute('CREATE INDEX IF NOT EXISTS goals_user_status ON goals(user_id,status,priority)')
        db.execute('PRAGMA user_version=3')

@contextmanager
def connection():
    db=sqlite3.connect(DB_PATH,timeout=15,isolation_level=None)
    db.row_factory=sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    try:
        yield db
    finally:
        db.close()

@contextmanager
def transaction():
    with connection() as db:
        db.execute('BEGIN IMMEDIATE')
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
