'use strict';
const HZ = (() => {
  const people = [{id:'lin',name:'小林',initial:'林',color:'#f0ad55',bg:'#fff0d9',room:'A'},{id:'ze',name:'阿泽',initial:'泽',color:'#6880d8',bg:'#edf0ff',room:'B'},{id:'xia',name:'小夏',initial:'夏',color:'#dd7399',bg:'#ffebf1',room:'C'},{id:'zhou',name:'周周',initial:'周',color:'#3e9b94',bg:'#e4f7f2',room:'D'}];
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const addDays=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
  const weekday = new Date(today+'T12:00:00Z').getUTCDay();
  const monday = addDays(today,-((weekday+6)%7));
  const person=id=>people.find(p=>p.id===id);
  const money=cents=>(cents/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
  const split=(total,ids)=>{const each=Math.floor(total/ids.length);return ids.map((id,i)=>({personId:id,cents:each+(i<total%ids.length?1:0),paid:false}))};
  const initial=()=>({version:1,current:'zhou',bills:[
    {id:'bill-water',title:'9月水费',category:'水电',total:24800,payer:'lin',date:today,shares:split(24800,people.map(p=>p.id)).map(s=>({...s,paid:['lin','xia'].includes(s.personId)}))},
    {id:'bill-electric',title:'9月电费',category:'水电',total:39600,payer:'ze',date:today,shares:split(39600,people.map(p=>p.id)).map(s=>({...s,paid:s.personId!=='zhou'}))},
    {id:'bill-tissue',title:'公共抽纸 · 12包',category:'日用品',total:4800,payer:'zhou',date:addDays(today,-1),shares:split(4800,people.map(p=>p.id)).map(s=>({...s,paid:['zhou','lin'].includes(s.personId)}))}
  ],tasks:Array.from({length:3},(_,week)=>[
    {id:'task-kitchen-'+week,area:'厨房',detail:'擦拭灶台、清理水槽和垃圾',due:addDays(today,week*7),owner:people[(3+week)%4].id,done:false,swap:null},
    {id:'task-living-'+week,area:'客厅',detail:'吸尘、拖地、整理茶几',due:addDays(today,2+week*7),owner:people[week%4].id,done:false,swap:null},
    {id:'task-bath-'+week,area:'卫生间',detail:'清洗台盆、马桶，补充纸巾',due:addDays(today,3+week*7),owner:people[(1+week)%4].id,done:false,swap:null},
    {id:'task-entry-'+week,area:'玄关',detail:'整理鞋柜，清扫门口地面',due:addDays(today,4+week*7),owner:people[(2+week)%4].id,done:week===0,swap:null}
  ]).flat(),items:[
    {id:'item-paper',name:'厨房纸巾',location:'厨房',status:'low',claim:null,last:addDays(today,-10)},
    {id:'item-soap',name:'洗洁精',location:'厨房',status:'empty',claim:null,last:addDays(today,-18)},
    {id:'item-tissue',name:'抽纸',location:'客厅',status:'full',claim:null,last:addDays(today,-1)},
    {id:'item-wash',name:'洗衣液',location:'阳台',status:'full',claim:null,last:addDays(today,-7)},
    {id:'item-bag',name:'垃圾袋',location:'厨房',status:'full',claim:null,last:addDays(today,-5)}
  ],pacts:[
    {id:'pact-quiet',title:'安静时段',content:'晚上 23:00 至早上 8:00 保持安静，听音乐、打游戏戴耳机。',version:1,confirmed:['lin','ze','xia'],updated:addDays(today,-2),history:[]},
    {id:'pact-visitor',title:'访客与留宿',content:'朋友来家里提前在群里告知；留宿需征得全体室友同意。',version:1,confirmed:['lin','ze','xia','zhou'],updated:addDays(today,-4),history:[]},
    {id:'pact-share',title:'公共费用',content:'水电、网费和公共用品按实际参与人数均分；垫付后登记账单，3天内结清。',version:1,confirmed:['lin','ze','xia','zhou'],updated:addDays(today,-4),history:[]},
    {id:'pact-clean',title:'公共区域使用',content:'做饭后及时清理灶台和餐具。个人物品收回房间，公共区域值日按排班轮换。',version:1,confirmed:['lin','ze','xia','zhou'],updated:addDays(today,-4),history:[]}
  ],events:[{id:'event1',text:'小林结清了公共抽纸的分摊',time:new Date().toISOString(),kind:'bills'},{id:'event2',text:'小夏完成了玄关清洁',time:new Date(Date.now()-3600000).toISOString(),kind:'cleaning'},{id:'event3',text:'阿泽标记洗洁精已用完',time:new Date(Date.now()-7200000).toISOString(),kind:'items'}]});
  let state=initial();
  try {const saved=JSON.parse(localStorage.getItem('hezhu-demo-v1'));if(saved?.version===1&&person(saved.current)&&Array.isArray(saved.bills)&&Array.isArray(saved.tasks)&&Array.isArray(saved.items)&&Array.isArray(saved.pacts)&&Array.isArray(saved.events))state=saved;}catch{}
  let onChange=()=>{},storageFailed=false;
  const save=()=>{try{localStorage.setItem('hezhu-demo-v1',JSON.stringify(state));storageFailed=false;}catch{storageFailed=true;}onChange();};
  const event=(text,kind)=>{state.events.unshift({id:uid(),text,time:new Date().toISOString(),kind});state.events=state.events.slice(0,30)};
  const me=()=>person(state.current);
  const requireId=(list,id)=>{const entity=list.find(x=>x.id===id);if(!entity)throw Error('这条记录不存在');return entity};
  const summary=()=>({owed:state.bills.reduce((sum,b)=>sum+b.shares.filter(s=>s.personId===state.current&&!s.paid).reduce((a,s)=>a+s.cents,0),0),receivable:state.bills.filter(b=>b.payer===state.current).reduce((sum,b)=>sum+b.shares.filter(s=>!s.paid).reduce((a,s)=>a+s.cents,0),0),tasks:state.tasks.filter(t=>t.owner===state.current&&!t.done&&t.due<=addDays(monday,6)).length});
  function createBill({title,total,payer,ids,category='其他',custom}) {
    if(!title?.trim()||title.trim().length>60)throw Error('请填写60字以内的费用名称');
    if(!Number.isSafeInteger(total)||total<=0||total>100000000)throw Error('请输入有效金额（最多100万元）');
    if(!person(payer)||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!person(id)))throw Error('请选择垫付人和至少一位分摊室友');
    let shares=split(total,ids);
    if(custom){if(ids.some(id=>!Number.isSafeInteger(custom[id])||custom[id]<0)||ids.reduce((a,id)=>a+custom[id],0)!==total)throw Error('各人的分摊金额合计需要等于总金额');shares=ids.map(id=>({personId:id,cents:custom[id],paid:false}));}
    const b={id:uid(),title:title.trim(),category,total,payer,date:today,shares:shares.map(s=>({...s,paid:s.personId===payer||s.cents===0}))};state.bills.unshift(b);event(me().name+'登记了「'+b.title+'」 ¥'+money(total),'bills');save();return b;
  }
  const actions={
    selectPerson(id){if(!person(id))throw Error('请选择已有室友');state.current=id;save();},
    createBill,
    settleBill(id){const b=requireId(state.bills,id),s=b.shares.find(s=>s.personId===state.current);if(!s||s.paid)throw Error('没有需要结清的分摊');s.paid=true;event(me().name+'结清了「'+b.title+'」 ¥'+money(s.cents),'bills');save();},
    remindBill(id){const b=requireId(state.bills,id);if(b.payer!==state.current)throw Error('只有垫付人可以提醒');if(b.shares.every(s=>s.paid))throw Error('这笔费用已结清');event(me().name+'提醒室友结清「'+b.title+'」','bills');save();},
    completeTask(id){const t=requireId(state.tasks,id);if(t.owner!==state.current||t.done||t.swap)throw Error('仅负责人可完成未换班的任务');t.done=true;event(me().name+'完成了'+t.area+'清洁','cleaning');save();},
    requestSwap(id,target){const t=requireId(state.tasks,id);if(t.owner!==state.current||t.done||t.swap||!person(target)||target===state.current)throw Error('无法发起这次换班');t.swap={from:state.current,to:target};event(me().name+'向'+person(target).name+'申请'+t.area+'换班','cleaning');save();},
    resolveSwap(id,accept){const t=requireId(state.tasks,id);if(!t.swap||t.swap.to!==state.current)throw Error('请由受邀室友确认换班');const from=person(t.swap.from).name;if(accept)t.owner=state.current;t.swap=null;event(me().name+(accept?'接受了':'婉拒了')+from+'的'+t.area+'换班申请','cleaning');save();},
    cancelSwap(id){const t=requireId(state.tasks,id);if(t.swap?.from!==state.current)throw Error('只有申请人可以取消');t.swap=null;save();},
    addSchedule({area,day,ids}){if(!area?.trim()||!Number.isInteger(day)||day<0||day>6||!ids?.length||new Set(ids).size!==ids.length||ids.some(id=>!person(id)))throw Error('请完整填写区域、日期和轮班室友');let firstDue=addDays(monday,day);if(firstDue<today)firstDue=addDays(firstDue,7);for(let i=0;i<4;i++)state.tasks.push({id:uid(),area:area.trim().slice(0,20),detail:'按室友顺序，每周自动轮换',due:addDays(firstDue,i*7),owner:ids[i%ids.length],done:false,swap:null});event(me().name+'新增了'+area.trim()+'的每周轮班','cleaning');save();},
    addItem({name,location,status}){if(!name?.trim()||!['full','low','empty'].includes(status))throw Error('请填写物品名称及状态');const item={id:uid(),name:name.trim().slice(0,30),location:location||'公共区域',status,claim:null,last:today};state.items.push(item);event(me().name+'登记了公共物品「'+item.name+'」','items');save();return item;},
    setItemStatus(id,status){const item=requireId(state.items,id);if(!['full','low','empty'].includes(status))throw Error('请选择有效状态');if(item.claim)throw Error('补货已被认领，请先完成或取消认领');item.status=status;event(me().name+'标记'+item.name+({full:'充足',low:'快用完',empty:'已用完'}[status]),'items');save();},
    claimItem(id){const item=requireId(state.items,id);if(item.status==='full'||item.claim)throw Error('这件物品暂时不需要认领');item.claim=state.current;event(me().name+'认领了'+item.name+'补货','items');save();},
    unclaimItem(id){const item=requireId(state.items,id);if(item.claim!==state.current)throw Error('只有认领人可以取消');item.claim=null;save();},
    purchaseItem(id,total,ids,makeBill=true){const item=requireId(state.items,id);if(item.claim!==state.current)throw Error('请由认领人完成补货');if(!Number.isSafeInteger(total)||total<=0||total>100000000)throw Error('请输入有效购买金额');if(!ids?.length||ids.some(id=>!person(id)))throw Error('请选择至少一位分摊室友');let b=null;if(makeBill)b=createBill({title:item.name+'补货',total,payer:state.current,ids,category:'日用品'});item.status='full';item.claim=null;item.last=today;event(me().name+'补好了'+item.name+(makeBill?'，已生成AA账单':''),'items');save();return b;},
    confirmPact(id){const p=requireId(state.pacts,id);if(p.confirmed.includes(state.current))throw Error('你已确认这条公约');p.confirmed.push(state.current);event(me().name+'确认了「'+p.title+'」','pacts');save();},
    editPact(id,{title,content}){if(!title?.trim()||!content?.trim()||title.length>30||content.length>500)throw Error('请填写公约标题和内容（最多500字）');if(id){const p=requireId(state.pacts,id);p.history.unshift({content:p.content,title:p.title,version:p.version,updated:p.updated});p.title=title.trim();p.content=content.trim();p.version++;p.confirmed=[];p.updated=today;event(me().name+'更新了「'+p.title+'」，请全员重新确认','pacts');}else{state.pacts.push({id:uid(),title:title.trim(),content:content.trim(),version:1,confirmed:[],updated:today,history:[]});event(me().name+'发起了新公约「'+title.trim()+'」','pacts');}save();},
    reset(){state=initial();save();}
  };
  return {people,person,today,monday,addDays,money,split,me,summary,actions,get state(){return state},get storageFailed(){return storageFailed},set onChange(fn){onChange=fn}};
})();
if(typeof module!=='undefined')module.exports=HZ;
