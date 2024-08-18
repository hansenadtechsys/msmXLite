try{
      // then refresh the page and run this to restore your form values:
  [].forEach.call(document.querySelector('#MSMXL').elements, function(el) {
    el.value = localStorage.getItem(el.name);
  });
}catch{
}
document.querySelector("#new-load-submit").value="Add Load";


const db=new Dexie("MSMXLite");
db.version(1).stores({
    loads:`
    ++id,
    timestamp,
    equipment_id,
    client, 
    location, 
    task, 
    weight, 
    area`,
});
const form = document.querySelector("#MSMXL");
const eid_in = document.querySelector("#equipment-input");
const client_in = document.querySelector("#client-input");
const location_in = document.querySelector("#location-input");
const task_in = document.querySelector("#task-input");
const weight_in = document.querySelector("#weight-input");
const area_in = document.querySelector("#area-input");
const load_list = document.querySelector("#loads");
const load_table_body=document.querySelector("#loadBody");

eid_in.addEventListener("change",prepareupdateStats);
eid_in.addEventListener("click",()=>{eid_in.value="";prepareupdateStats;});
client_in.addEventListener("change",prepareupdateStats);
client_in.addEventListener("click",()=>{client_in.value="";prepareupdateStats;});
location_in.addEventListener("change",prepareupdateStats);
location_in.addEventListener("click",()=>{location_in.value="";prepareupdateStats;});
task_in.addEventListener("change",prepareupdateStats);
task_in.addEventListener("click",()=>{task_in.value="";prepareupdateStats;});
weight_in.addEventListener("change",prepareupdateStats);
area_in.addEventListener("change",prepareupdateStats);

weightTotal=0;
loadArea=0;
loadWeight=0;
totalArea=0;

form.onsubmit = async (event)=>{
    event.preventDefault();
    const equip=eid_in.value;
    const client=client_in.value;
    const location=location_in.value;
    const task=task_in.value;
    weight=weight_in.value;
    if(Math.abs(weight)<2000){
        weight=weight*2000;
    }
    totalArea=area_in.value;
    const timestamp=getTimestamp();
    await db.loads.add({timestamp:timestamp, equipment_id:equip,client:client,location:location,task:task,weight:weight,area:totalArea});
    await getLoads(equip,client,location,task);
    await getWeightTotal(equip,client,location,task);
    await getAreas(equip,client,location,task);
    document.querySelector("#weight-input").value="";
    document.querySelector("#area-input").value="";
    updateStats();
    localStorage.setItem("area-input", "");
    localStorage.setItem("weight-input", "");
//    form.reset();
};
const getLoads=async (equip,client,location,task) => {
    const allLoads=await db.loads.where({equipment_id:equip,client:client,location:location,task:task}).limit(25).reverse().toArray();
    //load_table_body.innerHTML=allLoads.map(load=>`<tr>${load.timestamp} ${load.equipment_id} ${load.client} ${load.location} ${load.task} ${load.weight} ${load.area}</tr>` );
    tableData=allLoads.map(load => `<tr><td>${load.timestamp}</td><td>${load.equipment_id}</td><td>${load.client}</td><td> ${load.location}</td><td> ${load.task}</td><td> ${load.weight}</td><td> ${load.area}</td></tr>`).join('');
    load_table_body.innerHTML=tableData;
};
const getWeightTotal=async(equip,client, location, task)=>{
    const loadsumraw=await db.loads.where({client:client,location:location,task:task,equipment_id:equip}).toArray();
    sum=0;
    loadsumraw.forEach((obj)=>{
        sum+=parseFloat(obj['weight']);
        loadWeight=obj['weight'];
    }); 
    weightTotal=sum;
   
};
const getAreas=async(equip,client, location, task)=>{
    const loadsumraw=await db.loads.where({client:client,location:location,task:task,equipment_id:equip}).reverse().limit(2).toArray();
    diff=0;
    // d0=loadsumraw[0];
    // d1=loadsumraw[1];
    // loadArea=parseFloat(d0['area'])-parseFloat(d1['area']);
    a0=0;
    a1=0;
    loadsumraw.forEach((obj)=>{
        a0=a1;
        a1=parseFloat(obj['area']);
    });
    loadArea=a0-a1;
    totalArea=a1;  
};
function getTimestamp(){
    date=new Date();
    year=date.getFullYear();
    month=date.getMonth()+1;
    day=date.getDate();
    hour=date.getHours().toString();
    minute=date.getMinutes().toString();
    second=date.getSeconds().toString();
    timestamp= hour.padStart(2,'0')+":"+minute.padStart(2,'0')+":"+second.padStart(2,'0')+` ${month}-${day}-${year}`;
    return timestamp;
}
const updateStats=async()=>{
    const equip=eid_in.value;
    const client=client_in.value;
    const location=location_in.value;
    const task=task_in.value;
    await getWeightTotal(equip,client,location,task);
    await getLoads(equip,client,location,task);
    await getAreas(equip,client,location,task);

    document.querySelector("#weightstatpounds").innerHTML=weightTotal;
    document.querySelector("#weightstattons").innerHTML=weightTotal/2000; 
    document.querySelector("#areastat").innerHTML=loadArea;
    document.querySelector("#loadRate").innerHTML=loadWeight/loadArea;
    document.querySelector("#overallRate").innerHTML=weightTotal/totalArea;
}
function prepareupdateStats(){
    try{
            // run this in the terminal to save the state of your form
        // in your browser's LocalStorage:
        [].forEach.call(document.querySelector('#MSMXL').elements, function(el) {
            localStorage.setItem(el.name, el.value);
        });       
    }catch{
        
    }

    updateStats();
}
prepareupdateStats();