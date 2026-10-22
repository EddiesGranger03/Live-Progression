from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator
from zoneinfo import ZoneInfo

class Credentials(BaseModel):
    email: str = Field(min_length=3,max_length=254,pattern=r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
    password: str = Field(min_length=10,max_length=128)
    name: str = Field(default='Bạn',min_length=1,max_length=60)

class QuestWrite(BaseModel):
    id: str | None = None
    title: str = Field(min_length=1,max_length=100)
    description: str = Field(default='',max_length=500)
    duration: int = Field(ge=5,le=120)
    goal: str = Field(default='Cá nhân',max_length=40)
    goalId: str | None = Field(default=None,max_length=100)
    date: date
    @field_validator('title')
    @classmethod
    def title_valid(cls,v):
        if not v.strip(): raise ValueError('Tên không được để trống.')
        return v.strip()

class GoalWrite(BaseModel):
    id: str | None = Field(default=None,max_length=100)
    title: str = Field(min_length=1,max_length=100)
    description: str = Field(default='',max_length=500)
    @field_validator('title')
    @classmethod
    def title_valid(cls,v):
        if not v.strip(): raise ValueError('Tên mục tiêu không được để trống.')
        return v.strip()

class GoalPriority(BaseModel):
    id: str = Field(min_length=1,max_length=100)
    priority: Literal['normal','high']

class GoalArchive(BaseModel):
    id: str = Field(min_length=1,max_length=100)
    archived: bool = True

class RestWindow(BaseModel):
    start: str = Field(pattern=r'^([01]\d|2[0-3]):[0-5]\d$')
    end: str = Field(pattern=r'^([01]\d|2[0-3]):[0-5]\d$')
    @model_validator(mode='after')
    def valid(self):
        if self.end<=self.start: raise ValueError('Giờ nghỉ kết thúc phải sau giờ bắt đầu.')
        return self

class VoluntaryProtection(BaseModel):
    """Only general preferences are synced; selected apps stay on-device."""
    enabled: bool = False
    breakInterval: Literal[30,45,50,60] = 50

class ProfileWrite(BaseModel):
    name: str = Field(min_length=1,max_length=60)
    timezone: str
    goals: list[Literal['Học tập','Sức khỏe','Kỷ luật']] = Field(max_length=2)
    activeStart: str = Field(pattern=r'^([01]\d|2[0-3]):[0-5]\d$')
    activeEnd: str = Field(pattern=r'^([01]\d|2[0-3]):[0-5]\d$')
    rests: list[RestWindow] = Field(max_length=10)
    calendarEnabled: bool = True
    reminders: bool = False
    reminderLimit: int = Field(default=3,ge=1,le=3)
    protection: VoluntaryProtection = Field(default_factory=VoluntaryProtection)
    onboarding: bool = True
    @model_validator(mode='after')
    def valid(self):
        try: ZoneInfo(self.timezone)
        except Exception: raise ValueError('Múi giờ không hợp lệ.')
        if self.activeEnd<=self.activeStart: raise ValueError('Giờ kết thúc phải sau giờ bắt đầu.')
        if len(set(self.goals))!=len(self.goals): raise ValueError('Mục tiêu không được lặp.')
        if not self.name.strip(): raise ValueError('Vui lòng nhập tên.')
        return self

class BlockWrite(BaseModel):
    id: str | None = None
    title: str = Field(min_length=1,max_length=100)
    start: str
    end: str
    type: Literal['busy','rest'] = 'busy'
    focus: bool = False
    questId: str | None = None
    acceptConflict: bool = False

class QuickActionStart(BaseModel):
    title: str = Field(min_length=1,max_length=100)
    goal: str = Field(default='Cá nhân',max_length=40)
    questId: str | None = None
    duration: Literal[2,5,10]
    @field_validator('title')
    @classmethod
    def title_valid(cls,v):
        if not v.strip(): raise ValueError('Vui lòng mô tả một việc nhỏ.')
        return v.strip()

class QuickActionFinish(BaseModel):
    id: str = Field(min_length=1,max_length=100)
    outcome: Literal['done','unfinished','rest','skipped']

class Action(BaseModel):
    kind: Literal['quest.save','quest.complete','quest.undo','quest.archive','goal.save','goal.priority','goal.archive','block.save','block.delete','focus.start','focus.end','profile.save','quick.start','quick.finish']
    data: dict
    mutationId: str = Field(min_length=8,max_length=100)
    revision: int = Field(ge=0)
