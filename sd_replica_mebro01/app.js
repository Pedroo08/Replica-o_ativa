//imports
const express = require('express'); //servidor http
const bodyParser = require('body-parser');//midleware para trabalhar com json
const {PubSub} = require('@google-cloud/pubsub');
require('dotenv').config();
const { Sequelize } = require('sequelize');

//config
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3001;

const pubsub = new PubSub({
    projectId: "sd-ifba",
    keyFilename:'./credencial.json',
  });

//Atributos da máquina
const ID = "maq01"
const rotulo = "membro"


//conexão com com o banco
const sequelize = new Sequelize('membro01', 'postgres', '123456', {
  host: 'localhost',
  port: 5423,
  dialect: 'postgres' // ou outro dialeto, como 'mysql'
  //logging: true // Habilita logs
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/maq', (req, res) => {
    const maq = 
        { id: ID, rotulo: rotulo };
    res.json(maq);
});


 
async function getAndSubscribe() {

  const subName = 'sub-maq01-sql-order';

  try {

    // Confirma a uma referência à assinatura
    const subscription = pubsub.subscription(subName);

    // Ouvinte de mensagens
    subscription.on('message', (message) => {
      console.log(`Mensagem recebida: ${message.data.toString()}`);
      const data = message.data.toString()
      const dataObject = JSON.parse(data);
     console.log("data: " + dataObject.sql)
      console.log(executarComandoSQL(dataObject.sql));
      estouVivo()
       // Confirmar o recebimento
      message.ack();
    });

    console.log(`Ouvindo mensagens na assinatura ${subName}`);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Chamar a função para iniciar a inscrição e ouvir as mensagens
getAndSubscribe();


async function executarComandoSQL(comandoSQL) {
  try {
    const [results, metadata] = await sequelize.query(comandoSQL);
    return results;
    estouVivo()
   
  } catch (error) {
    console.error('Erro ao executar o comando SQL:', error);
    throw error;
  }
}


async function estouVivo(){
  try {
    const nomeTopico = 'vivo';
    const topic = pubsub.topic(nomeTopico);//define o tópico no client pub/sub

    // Verifica se o tópico existe
    await topic.get([nomeTopico]);


    // Publica a mensagem
    const data = Buffer.from(JSON.stringify({ id: ID, rotulo: rotulo }));
    

    const [messageId] = await topic.publish(data);
    console.log(`Messagem ${messageId} publicada no tópico ${nomeTopico}.`);

  } catch (error){
      console.log("Erro ao dar sinal de vida. Erro  ======>>>>>" + error);
  }

}
