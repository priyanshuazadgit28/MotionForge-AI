fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'test' }],
    projectId: 'cmqkspgv5000djs4hrgy5ip1l'
  })
}).then(async res => {
  console.log(res.status);
  console.log(await res.text());
}).catch(console.error);
