import {State,Quest,localDate,shiftDate,fromLocal,hm} from './models';
export function seedState():State {
  const tz='Asia/Ho_Chi_Minh', today=localDate(new Date(),tz);
  const goals=[
    {id:'goal-study',title:'Duy trì thói quen học mỗi ngày',description:'Tiến từng bước nhỏ để giữ nhịp học tập đều đặn.',priority:'high' as const,status:'active' as const,createdAt:fromLocal(today,'08:00',tz)},
    {id:'goal-health',title:'Chăm sóc sức khỏe',description:'Dành thời gian vận động và nghỉ ngơi trong tuần.',priority:'normal' as const,status:'active' as const,createdAt:fromLocal(today,'08:05',tz)}
  ];
  const quests:Quest[]=[
    {id:'read',title:'Đọc 10 trang',description:'Chọn một cuốn sách và đọc 10 trang. Đặt điện thoại ngoài tầm với.',duration:10,goal:'Học tập',goalId:'goal-study',date:today,timezone:tz,status:'pending',completedAt:null},
    {id:'walk',title:'Đi bộ 15 phút',description:'Ra ngoài, hít thở và đi bộ với nhịp độ thoải mái. Cho đôi mắt nghỉ ngơi khỏi màn hình.',duration:15,goal:'Sức khỏe',goalId:'goal-health',date:today,timezone:tz,status:'pending',completedAt:null},
    {id:'tidy',title:'Dọn góc học tập',description:'Dành 10 phút sắp xếp lại bàn. Giữ lại những thứ bạn cần cho công việc trước mắt.',duration:10,goal:'Cá nhân',goalId:null,date:today,timezone:tz,status:'completed',completedAt:fromLocal(today,'09:00',tz)}
  ];
  const count=[1,2,0,1,1,2,1], timer=[10,20,0,25,20,30,15];
  const ledger:any[]=[{id:'base',questId:'legacy',amount:1180,reason:'sample',createdAt:fromLocal(shiftDate(today,-30),'09:00',tz),localDate:shiftDate(today,-30),timezone:tz}];
  const sessions:any[]=[];
  count.forEach((n,i)=>{const date=shiftDate(today,i-6);for(let j=0;j<n;j++){
    const id=i===6?'tidy':`history-${i}-${j}`;
    if(i!==6)quests.push({id,title:j?'Vận động nhẹ':'Đọc sách mỗi ngày',description:'Một hành động nhỏ được bạn tự xác nhận.',duration:10,goal:'Học tập',goalId:j?'goal-health':'goal-study',date,timezone:tz,status:'completed',completedAt:fromLocal(date,'09:00',tz)});
    ledger.push({id:`ledger-${i}-${j}`,questId:id,amount:20,reason:'completion',createdAt:fromLocal(date,'09:00',tz),localDate:date,timezone:tz});
  }
  if(timer[i])sessions.push({id:`session-${i}`,title:'Một khoảng tập trung',start:fromLocal(date,'08:00',tz),targetEnd:fromLocal(date,hm(480+timer[i]),tz),actualEnd:fromLocal(date,hm(480+timer[i]),tz),status:'completed',questId:null,blockId:null});});
  return {profile:{name:'Gia Long',email:'gia.long@example.com',timezone:tz,goals:['Học tập','Sức khỏe'],activeStart:'08:00',activeEnd:'22:00',rests:[{start:'12:00',end:'13:00'}],calendarEnabled:true,reminders:false,reminderLimit:3,protection:{enabled:false,breakInterval:50},onboarding:true},goals,quests,
    blocks:[{id:'class',title:'Học trên lớp',start:fromLocal(today,'13:00',tz),end:fromLocal(today,'14:00',tz),type:'busy',focus:false,questId:null},
    {id:'homework',title:'Hoàn thành bài tập',start:fromLocal(today,'14:00',tz),end:fromLocal(today,'14:45',tz),type:'busy',focus:true,questId:null},
    {id:'break',title:'Nghỉ ngơi',start:fromLocal(today,'14:45',tz),end:fromLocal(today,'15:00',tz),type:'rest',focus:false,questId:null},
    {id:'team',title:'Làm việc nhóm',start:fromLocal(today,'15:30',tz),end:fromLocal(today,'16:30',tz),type:'busy',focus:false,questId:null}],sessions,quickSessions:[],ledger,xp:1340,revision:0};
}
