const express = require('express');
const {Sequelize, DataTypes, Model} = require('sequelize');
const { Database } = require('sqlite3');
const monday = express();
const port = 3000;

const sequelize = new Sequelize('sqlite:BancoDados.sqlite');

//Tabela Monday
class Monday extends Model {}
Monday.init({
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nome_empresa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status_dctf: {
        type: DataTypes.STRING,
        allowNull: false
    }

},{sequelize, modelName:'QuadroMonday'});

//Tabela Banco
class BoardDB extends Model {}
BoardDB.init({
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nome_empresa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status_dctf: {
        type: DataTypes.STRING,
        allowNull: false
    }

},{sequelize, modelName:'QuadroBanco'});


sequelize.sync();

monday.use(express.json())

//CRUD QUADRO MONDAY

monday.get('/monday', async (req, res) => {
    const monday = await Monday.findAll()
    if(monday){
        res.json(monday)
        res.status(200).json({message: 'Quadro encontrado'})
    } else {
        res.status(400).json({message: 'O quadro nao possui solicitacoes'})
    }
})

monday.get('/monday/:id', async (req, res) => {
    const monday = await Monday.findByPk(req.params.id)
    if(monday){
        res.json(monday)
        res.status(200).json({message: 'Solicitacao encontrada'})
    } else {
        res.status(400).json({message: 'Solicitacao nao encontrada'})
    }
})

monday.post('/monday', async(req, res) => {
const monday = await Monday.create(req.body)
    if(monday){
      if(monday.status === 'Em progresso') {
        const _monday = await BoardDB.create(req.body)
        if(_monday) {
            res.json(_monday) 
            res.status(200).json({message: 'Solicitacao criada e enviada ao banco de dados'})
        }else {
            res.status(400).json({message: 'A solicitacao nao foi enviada ao banco de dados'})
        }     
      } else {
            await monday.update(req.body)
            res.json(monday) 
            res.status(200).json({message: 'Solicitacao criada apenas no Monday'})
      }
    } else {
        res.status(400).json({message: 'A solicitacao nao foi realizada'})
}
})

monday.put('/monday/:id', async(req, res) => {
    const monday = await Monday.findByPk(req.params.id)
    if (monday) {
        if(monday.status === 'Em progresso') {
            const _monday = await BoardDB.create(req.body)
            res.json(_monday) 
            res.status(200).json({message: 'Solicitacao atualizada no quadro e enviada ao banco de dados'})
        } else {
            await monday.update(req.body)
            res.json(monday) 
            res.status(200).json({message: 'Solicitacao atualizada apenas no monday'})
        }
    }else {
        res.status(400).json({message: 'Solicitacao nao encontrada'})
    }
})

monday.delete('/monday/:id', async(req, res) => {
    const monday = await Monday.findByPk(req.params.id)
    const _monday = await BoardDB.findByPk(req.params.id)
    if(monday) {
        if (_monday) {
            await monday.destroy(req.body)
            await _monday.destroy(req.body)
            res.status(200).json({message: 'Solicitacao excluida nos dois quadros'})
            } else {
                await monday.destroy(req.body)
                res.status(200).json({message: 'Solicitacao excluida'})
            }
    }else {
        res.status(400).json({message: 'A solicitacao nao foi encontrada'})
    }
})

//CRUD BANCO DE DADOS

monday.put('/banco/:id', async(req, res) => {
    const banco = await BoardDB.findByPk(req.params.id)
    if (banco) {
        const banco__anterior = banco.toJSON();
        delete banco__anterior['id'];
        delete banco__anterior['createdAt'];
        delete banco__anterior['updatedAt'];

        await banco__anterior.update(req.body);

        if (banco.status === 'Concluido'){
            const banco_concluido = await BoardDB.findByPk(req.params.id)
            if(banco_concluido){
                const banco_toMonday = await Monday.update(req.body)
                res.json(banco_toMonday) 
                res.status(200).send(banco__anterior)
            } else  {
                await banco.update(banco__anterior);
                res.status(400).send({message: 'Falha na atualizacao do quadro monday'})
            }     
        } else {
            res.json(banco) 
            res.status(200).json({message: 'Apenas o banco de dados foi atualizado'})
        }
    } else {
        res.status(400).json({message: 'ID nao encontrado no banco'})
    }
})

monday.delete('/banco/:id', async(req, res) => {
    const banco = await BoardDB.findByPk(req.params.id)
    if (banco) {
        await banco.destroy(req.body)
        res.status(200).json({message: 'Solicitacao excluida'})
    }else {
        res.status(400).json({message: 'Solicitacao nao encontrada no banco'})
    }
})

//start server
monday.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

//dentro da pasta npm install