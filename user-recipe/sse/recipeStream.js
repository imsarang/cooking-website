let clients = []

export const registerSSE = (req,res)=>{
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    clients.push(res)
    req.on('close', () => {
        clients = clients.filter(client => client !== res)
    })
    console.log(`Client connected`)
}

export const sendToClients = (data) => {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`)
    })
}