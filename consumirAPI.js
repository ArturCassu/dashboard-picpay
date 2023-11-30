let oci = async () => {
    let lista = []
    let listaRuins = []
    let response = await fetch("https://ocistatus.oraclecloud.com/api/v2/components.json")
    let body = await response.json();
    body['regionHealthReports'].forEach(element => {
        
        if (element['regionName'].includes('Brazil')) {
            lista.push(element)
        }

    });
    
    lista.forEach(element => {
        element['serviceHealthReports'].forEach(element2 =>{
            if (element2['serviceStatus'] != 'NormalPerformance') {
                listaRuins.push({
                    "regiao": element["regionName"],
                    "servico": element2["serviceName"],
                    "status":element2['serviceStatus']
                    })
            }
        });
    })

    return listaRuins
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

let resultados = async()=>{
    console.log(await oci())
    console.log(await jira())
}

resultados()


