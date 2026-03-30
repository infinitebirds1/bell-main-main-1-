
const COLORS = {
  class:   "#1a1814",
  passing: "#b0a090",
  lunch:   "#4a7c59",
  free:    "#4a7c59",
  ann:     "#8b7060",
  ssr:     "#5c6b8a",
};

const SCHEDULES = {
  monday: {
    label: "Monday",
    periods: [
      { name: "1st Period",       start: "08:45", end: "09:35", type: "class"   },
      { name: "Passing",          start: "09:35", end: "09:40", type: "passing" },
      { name: "2nd Period",       start: "09:40", end: "10:30", type: "class"   },
      { name: "Passing",          start: "10:30", end: "10:40", type: "passing" },
      { name: "3rd Period",       start: "10:40", end: "11:30", type: "class"   },
      { name: "Passing",          start: "11:30", end: "11:35", type: "passing" },
      { name: "4th Period + Ann", start: "11:35", end: "12:30", type: "ann"     },
      { name: "Lunch",            start: "12:30", end: "13:05", type: "lunch"   },
      { name: "Passing",          start: "13:05", end: "13:10", type: "passing" },
      { name: "5th Period",       start: "13:10", end: "14:00", type: "class"   },
      { name: "Passing",          start: "14:00", end: "14:05", type: "passing" },
      { name: "6th Period",       start: "14:05", end: "14:55", type: "class"   },
      { name: "Passing",          start: "14:55", end: "15:00", type: "passing" },
      { name: "7th Period",       start: "15:00", end: "15:50", type: "class"   },
    ]
  },
  tuethu: {
    label: "Tue / Thu",
    periods: [
      { name: "Period 1",        start: "08:45", end: "10:15", type: "class"   },
      { name: "Passing",         start: "10:15", end: "10:25", type: "passing" },
      { name: "Period 3 + Ann",  start: "10:25", end: "12:00", type: "ann"     },
      { name: "Lunch",           start: "12:00", end: "12:35", type: "lunch"   },
      { name: "Passing",         start: "12:35", end: "12:40", type: "passing" },
      { name: "Period 5",        start: "12:40", end: "14:10", type: "class"   },
      { name: "Passing",         start: "14:10", end: "14:15", type: "passing" },
      { name: "Period 7",        start: "14:15", end: "15:45", type: "class"   },
    ]
  },
  wedfri: {
    label: "Wed / Fri",
    periods: [
      { name: "Period 2",        start: "08:45", end: "10:15", type: "class"   },
      { name: "Passing",         start: "10:15", end: "10:25", type: "passing" },
      { name: "SSR + Ann",       start: "10:25", end: "11:20", type: "ssr"     },
      { name: "Lunch",           start: "11:20", end: "11:50", type: "lunch"   },
      { name: "Passing",         start: "11:50", end: "12:00", type: "passing" },
      { name: "Period 4",        start: "12:00", end: "13:30", type: "class"   },
      { name: "Passing",         start: "13:30", end: "13:35", type: "passing" },
      { name: "Period 6",        start: "13:35", end: "15:05", type: "class"   },
    ]
  }
};

function toMin(t) { const [h,m]=t.split(":").map(Number); return h*60+m; }
function pad(n) { return String(Math.floor(n)).padStart(2,"0"); }
function fmtTime(min) {
  const h=Math.floor(min/60)%24,m=min%60,ap=h>=12?"PM":"AM",hh=h%12||12;
  return `${hh}:${pad(m)} ${ap}`;
}
function fmtClock(d) {
  const h=d.getHours(),m=d.getMinutes(),s=d.getSeconds(),ap=h>=12?"PM":"AM",hh=h%12||12;
  return `${hh}:${pad(m)}:${pad(s)} ${ap}`;
}
const DAYNAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getDaySched(dow) {
  if (dow===1) return {key:"monday",...SCHEDULES.monday};
  if (dow===2||dow===4) return {key:"tuethu",...SCHEDULES.tuethu};
  if (dow===3||dow===5) return {key:"wedfri",...SCHEDULES.wedfri};
  return null;
}

let lastKey=null, lastActiveIdx=-2;

function buildList(sched) {
  const el=document.getElementById("schedList");
  el.innerHTML="";
  sched.periods.forEach((p,i)=>{
    const color=COLORS[p.type]||"#b0a090";
    const div=document.createElement("div");
    div.className="sched-item future";
    div.id=`si-${i}`;
    div.style.setProperty("--item-color",color);
    let tag="";
    if(p.type==="passing") tag=`<span class="type-tag">passing</span>`;
    else if(p.type==="lunch") tag=`<span class="type-tag">lunch</span>`;
    else if(p.type==="ann") tag=`<span class="type-tag">ann</span>`;
    else if(p.type==="ssr") tag=`<span class="type-tag">ssr</span>`;
    div.innerHTML=`
      <div class="sched-pip"></div>
      <div class="sched-name">${p.name}${tag}</div>
      <div class="sched-time">${fmtTime(toMin(p.start))}–${fmtTime(toMin(p.end))}</div>`;
    el.appendChild(div);
  });
}

function setAccent(color) {
  document.querySelectorAll(".cd-num").forEach(e=>e.style.color=color);
  document.getElementById("progFill").style.background=color;
}

function renderCD(left, color) {
  const hrs=Math.floor(left/3600),mins=Math.floor((left%3600)/60),secs=left%60;
  const hEl=document.getElementById("cdH"),hSep=document.getElementById("cdSepH");
  if(hrs>0){hEl.style.display="";hSep.style.display="";hEl.textContent=pad(hrs);}
  else{hEl.style.display="none";hSep.style.display="none";}
  document.getElementById("cdM").textContent=pad(mins);
  document.getElementById("cdS").textContent=pad(secs);
  document.querySelectorAll(".cd-num").forEach(e=>e.style.color=color);
}

function tick() {
  const now=new Date();
  const dow=now.getDay();
  const curMin=now.getHours()*60+now.getMinutes();
  const curSec=curMin*60+now.getSeconds();

  document.getElementById("dayBadge").textContent=DAYNAMES[dow];
  document.getElementById("liveTime").textContent=fmtClock(now);

  const ds=getDaySched(dow);

  if(!ds) {
    document.getElementById("nowName").textContent="Weekend";
    setAccent(COLORS.free);
    const nextMon=new Date(now);
    const daysUntilMon=(8-dow)%7;
    nextMon.setDate(nextMon.getDate()+daysUntilMon);
    nextMon.setHours(8,45,0,0);
    const leftSec=Math.max(0,Math.floor((nextMon-now)/1000));
    renderCD(leftSec,COLORS.free);
    document.getElementById("spanStart").textContent="–";
    document.getElementById("spanEnd").textContent="School resumes Monday";
    document.getElementById("progFill").style.width="0%";
    document.getElementById("nextRow").style.display="none";
    if(lastKey!=="wknd"){document.getElementById("schedList").innerHTML="";lastKey="wknd";}
    return;
  }

  if(lastKey!==ds.key){
    buildList(ds);
    lastKey=ds.key;lastActiveIdx=-2;
  }

  const periods=ds.periods.map(p=>({...p,startMin:toMin(p.start),endMin:toMin(p.end),color:COLORS[p.type]||"#b0a090"}));
  const schoolStart=periods[0].startMin,schoolEnd=periods[periods.length-1].endMin;

  let activeIdx=-1;
  for(let i=0;i<periods.length;i++){
    if(curMin>=periods[i].startMin&&curMin<periods[i].endMin){activeIdx=i;break;}
  }

  let nextIdx=-1;
  if(activeIdx>=0&&activeIdx+1<periods.length) nextIdx=activeIdx+1;
  else if(activeIdx===-1){for(let i=0;i<periods.length;i++){if(curMin<periods[i].startMin){nextIdx=i;break;}}}

  if(activeIdx!==lastActiveIdx){
    periods.forEach((_,i)=>{
      const el=document.getElementById(`si-${i}`);
      if(!el)return;
      el.classList.remove("active","past","future");
      if(i===activeIdx)el.classList.add("active");
      else if(periods[i].endMin<=curMin)el.classList.add("past");
      else el.classList.add("future");
    });
    lastActiveIdx=activeIdx;
  }

  if(activeIdx>=0){
    const p=periods[activeIdx];
    setAccent(p.color);
    document.getElementById("nowName").textContent=p.name;
    document.getElementById("spanStart").textContent=fmtTime(p.startMin);
    document.getElementById("spanEnd").textContent=fmtTime(p.endMin);
    const left=p.endMin*60-curSec,total=(p.endMin-p.startMin)*60;
    renderCD(left,p.color);
    document.getElementById("progFill").style.width=`${Math.min(100,((total-left)/total)*100)}%`;
  } else if(curMin<schoolStart){
    setAccent(COLORS.free);
    document.getElementById("nowName").textContent="Free";
    document.getElementById("spanStart").textContent="–";
    document.getElementById("spanEnd").textContent=`School starts ${fmtTime(schoolStart)}`;
    const left=schoolStart*60-curSec;
    renderCD(left,COLORS.free);
    document.getElementById("progFill").style.width="100%";
  } else {
    setAccent(COLORS.free);
    document.getElementById("nowName").textContent="Free";
    document.getElementById("spanStart").textContent="–";
    document.getElementById("spanEnd").textContent="Done for today";
    document.getElementById("cdH").style.display="none";
    document.getElementById("cdSepH").style.display="none";
    document.getElementById("cdM").textContent="--";
    document.getElementById("cdS").textContent="--";
    document.getElementById("progFill").style.width="100%";
  }

  if(nextIdx>=0){
    const np=periods[nextIdx];
    document.getElementById("nextRow").style.display="";
    document.getElementById("nextName").textContent=np.name;
    document.getElementById("nextTime").textContent=fmtTime(np.startMin);
  } else {
    document.getElementById("nextRow").style.display="none";
  }
}

tick();
setInterval(tick,1000);
