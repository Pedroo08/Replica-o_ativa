//imports
const express = require('express'); //servidor http
const cors = require('cors');
const bodyParser = require('body-parser');//midleware para trabalhar com json
const {PubSub} = require('@google-cloud/pubsub');
require('dotenv').config();
const { Sequelize } = require('sequelize');

//config
const app = express();
app.use(cors())
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
//const sequelize = require('./dbconfig/sequelize');
const pubsub = new PubSub({
    projectId: "sd-ifba",
    keyFilename:'./credencial.json',
  });

//Atributos da máquina
const ID = "maq00" 
const rotulo = "líder"
var membros = []; 


//conexão com com o banco
const sequelize = new Sequelize('liderdb', 'postgres', '123456', {
  host: 'localhost',
  port: 5423,
  dialect: 'postgres' // ou outro dialeto, como 'mysql'
  //logging: true // Habilita logs
});


//Função para Executar sql no Banco de dados
async function executarComandoSQL(comandoSQL) {

  console.log()
  try {
    const [results, metadata] = await sequelize.query(comandoSQL);
    return results;
   
  } catch (error) {
    console.error('Erro ao executar o comando SQL:', error);
    throw error;
  }
}


//Endpoints para interação
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


app.get('/membros', (req, res) => {
    res.send(membros);
});

app.get('/maq', (req, res) => {
    const maq = 
        { id: ID, rotulo: rotulo };
    res.status(200).json(maq);
});

//endepoint para enviar o comando sql
app.post('/publish', async (req, res) => {

    let sql = req.body.sql;
     console.log(req.body.sql);

     try{
      executarComandoSQL(sql);
      sqlpublish(req , res);

     }catch(error){
      console.log(error)
     }
    
  
      
  
}  )
    

getAndSubscribe()

  // Função para publicar no topico
  async function sqlpublish(req, res){

    membros = [];
    try {
      const topicName = 'sql-order';
      const topic = pubsub.topic(topicName);//define o tópico no client pub/sub
  
      // Verifica se o tópico existe
      await topic.get([topicName]);
  
      // Publica a mensagem
      const data = Buffer.from(JSON.stringify(req.body));
      const [messageId] = await topic.publish(data);
      console.log(`Message ${messageId} published.`);
      return res.status(200).send(`Message published to ${topicName}`);

    } catch (error){
        console.log("ERRO ======>>>>>" + error);
    }
  
  }

  //ouve os membros
  async function getAndSubscribe() {

    const subName = 'vivo-sub';
  
    try {
  
      // Confirma a uma referência à assinatura
      const subscription = pubsub.subscription(subName);
        console.log("/n/n========Verificação dos membros========")
      // Ouvinte de mensagens
      subscription.on('message', (message) => {
        //console.log(`Mensagem recebida: ${message.data.toString()}`);
        const data = message.data
       console.log("Membros Ativos: " + data)

       if(!membros.includes(data)){
        membros.push(JSON.parse(data))
       }
         // Confirmar o recebimento
        message.ack();
      });
  
      console.log(`Ouvindo mensagens na assinatura ${subName}`);
    } catch (error) {
      console.error('Erro:', error);
    }
  }





