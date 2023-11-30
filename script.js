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

