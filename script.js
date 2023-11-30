// const { Pool } = require('pg');
 
// const pool = new Pool({   
//     user: 'ccvtcvkc', 
//     host: 'silly.db.elephantsql.com',
//     database: 'ccvtcvkc',   
//     password: 'EvPqnJX-xEzrEHe66GTjaIdPLhakxz3I',   
//     port: 5432,
//     ssl: true
// })

// // pool.query(`insert into historico(nome_da_empresa, descricao_erro, regiao, tempo_do_erro) values (${nome_da_empresa}, ${descricao_erro}, ${regiao}, ${tempo_do_erro})`)
// const fetchData = async (name_company, descricao_erro, region) =>{
//     res = await pool.query(
//         `INSERT INTO historico(name_company, error_description, region, error_time) VALUES ($1, $2, $3, current_timestamp)`,
//         [name_company, descricao_erro, region]
//       );    
//     console.log(res);
// }

let oci = async () => {
    let list = []
    let failedServers = []
    let response = await fetch("https://ocistatus.oraclecloud.com/api/v2/components.json")
    let body = await response.json();
    body['regionHealthReports'].forEach(element => {
        
        if (element['regionName'].includes('Brazil')) {
            list.push(element)
        }

    });
    
    list.forEach(element => {
        element['serviceHealthReports'].forEach(element2 =>{
            if (element2['serviceStatus'] != 'NormalPerformance') {
                failedServers.push({
                    "region": element["regionName"],
                    "service": element2["serviceName"],
                    "status":element2['serviceStatus']
                    })
            }
        });
    })

    return failedServers
}

let jira = async () => {

    let response = await fetch("https://status.atlassian.com/api/v2/status.json")
    let body = await response.json();

    if (body['status']['description'] != 'All Systems Operational') {
        return body['status']['description']
    } else {
        return []
    }

}

const resultados = async()=>{
    return{
        "oci": (await oci()),
        "jira":(await jira())
    }
}

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const run = async () => {
    let bars = {
        "aws":[],
        "oci":[],
        "jira":[]
        }
        
    while (true){
        let res = (await resultados())
        Object.keys(res).forEach(key =>{
            let status
            if (res[key].length > 0){
                status = "false"
                if (key == "aws"){
                    fetchData(name_company, descricao_erro, region)
                }
                if (key == "oci"){
                    res[key].forEach(erros =>{
                        fetchData("oci", erros["service"], erros["region"])
                    })
                }
                if (key == "jira"){
                    fetchData("jira", res[key], "undefined")
                }

            }
            else{
                status = "true"
            }
            bars[key].push('<div id="status_bar_'+status+'" class="animation"></div>')
            
            if (bars[key].length > 5){
                if (bars[key][0][20]=="t"){
                    bars[key][0] = '<div id="status_bar_true" class="animation2"></div>'
                }else{
                    bars[key][0] = '<div id="status_bar_false" class="animation2"></div>'
                }
            }
            document.getElementById("status_block_"+key).innerHTML = bars[key].reverse().toString().replaceAll(',','')

            bars[key].reverse()
        })
        await delay(15100);
        Object.keys(res).forEach(key =>{
            if (bars[key].length > 5){
                bars[key].shift()
            }
            let status
            if (res[key].length > 0){
                status = "false"
            }
            else{
                status = "true"
            }
            bars[key][bars[key].length-1] = ('<div id="status_bar_'+status+'"></div>')
            
        })
        
    }
};

window.onload = run()

//POP UP

function openModal(){
    const modal = document.getElementById('modal-window')
    modal.classList.add('open')

    modal.addEventListener('click',(e) =>{
            if(e.target.id == 'close' || e.target.id == 'modal-window'){
                modal.classList.remove('open')
            }
})
}