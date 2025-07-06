const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const fileUpload = require('express-fileupload')
app.use(fileUpload())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads')) // config static file

const bookController = require('./controllers/BookController')
app.use('/book', bookController)

const cors = require('cors')
app.use(cors()) 

function checkSingIn(req, res, next) {
    try {
        const secret = process.env.TOKEN_SECRET
        const token = req.headers['authorization']
        const result = jwt.verify(token, secret)
        
        if(result != undefined){
            next()
        }
    } catch (e) {
        res.status(500).send({error: e.message})
    }
}

app.get('/user/info', checkSingIn, (req, res, next) => {
    try {
        res.send('hello back office user info')
    } catch (e) {
        res.status(500).send({error: e.message})
    }
})

app.get('/book/list', async (req, res) => { 
    const data = await prisma.book.findMany() // SELECT * FROM "Book"
    res.send({ data: data })
})

/* PRISMA BASIC */ 
/* BASIC CRUD USING PRISMA IN API METHOD */ 

// create basic
app.post('/book/create', async (req, res) => {
    const data = req.body
    const result = await prisma.book.create({
        data: data
    }) // INSERT INTO Book (isbn, name price) VALUES(:isbn, :name, :price)
    res.send({ result: result})
})

// create manual
app.post('/book/createManual', async (req, res) => {
    const result = await prisma.book.create({
        data: {
            isbn: '1004',
            name: 'Flutter',
            price: 850
        }
    })
    res.send({ result : result })
})

// update data book
app.put('/book/update/:id', async (req, res) => {
    try {
        await prisma.book.update({
            data: {
                isbn: '10024',
                name: 'test update',
                price: 900
            },
            where: {
                id: parseInt(req.params.id)
            }
        }) // UPDATE "Book" SET isbn = :isbm, name = :name, price = :price WHERE id = :id 

        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.messge })
    }
})

// delete data book
app.delete('/book/remove/:id', async (req, res) => {
    try {
        await prisma.book.delete({
            where: {
                id: parseInt(req.params.id)
            }
        }) // DELETE FRON "Book" WHERE id = :id

        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

/* END */
/* QUERY SEARCH */

// search data  
app.post('/book/search', async (req, res) => {
    try {
        const keyword = req.body.keyword
        const data = await prisma.book.findMany({
            where: {
                name: {
                    contains: keyword // LIKE('%keyword%')
                }
            }
        })

        res.send({ reuslts: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// search start with
app.post('/book/startWith', async (req, res) => {
    try {
        const keyword = req.body.keyword
        const data = await prisma.book.findMany({
            where: {
                name: {
                    startsWith: keyword
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// search end with
app.post('/book/endsWith', async (req, res) => {
    try {
        const keyword = req.body.keyword
        const data = await prisma.book.findMany({
            where: {
                name: {
                    endsWith: keyword
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

/* END */

/* QUERY ORDERBY */

// order by data desc
app.get('/book/orderBy', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            orderBy: {
                price: 'desc'
            }
        })

        res.send({ results: data})
    } catch (e) {
        res.status(500).send({ error: e.messge })
    }
})

/* END */

/* QUERY MAX MIN*/

// query data gt (max มากกว่า)  
app.get('/book/gt', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                price: {
                    gt: 900 // > 900
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message})
    }
})

// query data lt (min ต่ำกว่า) 
app.get('/book/lt', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                price: {
                    lt: 1000 // < 1000
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message})
    }
})

/* END */

/* QUERY NULL */

// query not null data 
app.get('/book/notNull', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                detail: {
                    not: null
                }
            }
        })
        res.send({ resuts: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// query is null
app.get('/book/isNull', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                detail: null
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

/* END */

/* QUERY AGGREGATE */

// query between data
app.get('/book/between', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                AND:{ // มีหรือไม่มีก็ได้ เพราะ and มันจะเป็น defual
                    // lte ต้องขึ้นก่อน gt
                   price: {
                        lte: 1500 // <= 1500
                    },
                    price: {
                        gte: 900 // >= 900
                    }

                    // อีกรูปแบบ
                    
                    /*
                    prince: {
                        lte: 1500,
                        gte: 900
                    }
                    */
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// query sum data
app.get('/book/sum', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _sum: {
                price: true
            }
        })

        res.send({ result: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// query max data
app.get('/book/max', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _max: {
                price: true
            }
        })

        res.send({ result: data })
    } catch (e) {
        res.status(500).send({ error: e.message})
    }
})

// query min data
app.get('/book/min', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _min: {
                price: true
            }
        })

        res.send({ result: data })
    } catch (e) {
        res.status(500).send({ error: e.message})
    }
})

// query avg data 
app.get('/book/avg', async (req, res) => {
    try {
        const data = await prisma.book.aggregate({
            _avg: {
                price: true
            }
        })

        res.send({ result: data })
    } catch (e) {
        res.status(500).send({ error: e.message})
    }
})
/* END */

/*  QUERY FOR DATETIME */

// query day
app.get('/book/findYearMontDay', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                registreDate: new Date('2024-05-08')
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// query Month
app.get('/book/findYearMonth', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                registreDate: {
                    gte: new Date('2024-05-01'),
                    lte: new Date('2024-05-31')
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// query year
app.get('/book/findYear', async (req, res) => {
    try {
        const data = await prisma.book.findMany({
            where: {
                registreDate: {
                    gte: new Date('2024-01-01'),
                    lte: new Date('2024-12-31')
                }
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

/* END */

/* END LEARNING PRISMA */

/* JSON WEB TOKEN LEARNING */
app.get('/user/createToken', (req, res) => {
    try {
        const secret = process.env.TOKEN_SECRET
        const payload = {
            id:100,
            name: 'phet',
            level: 'admin'
        }

        const token = jwt.sign(payload, secret, { expiresIn: '1d' })
        res.send({ token: token })
    } catch(e) {
        res.status(500).send({ error: e.message})
    }
})

app.get('/user/verifyToken', (req, res) => {
    try {
        const secret = process.env.TOKEN_SECRET
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwLCJuYW1lIjoicGhldCIsImxldmVsIjoiYWRtaW4iLCJpYXQiOjE3NTE3NzgzODksImV4cCI6MTc1MTg2NDc4OX0.p4CLfbgabN6r_0XCSDzioDHxvLFTQ5O8JW-_SmPnUj0"
        const result = jwt.verify(token, secret)

        res.send({ result : result })
    } catch (e) {
        res.status(500).send({ error: e.message })
    } 
})

/* END */

/* RELATION SHIP*/
app.get('/oneToOne', async (req, res) => {
    try {
        const data = await prisma.orderDetail.findMany({
            include: {
                Book: true
            }
        })

        res.send({ results: data })
    } catch (e) {
        res.status(500).send({ error: e.message})
    }
})

app.get('/oneToMany', async(req, res) => {
    try {
        const data = await prisma.book.findMany({
            include: {
                OrderDetail: true
            }
        })

        res.send({ result: data })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/multiModel', async (req, res) => {
    try {
        const data = await prisma.customer.findMany({
            include: {
                Order: {
                    include: {
                        OrderDetail: true
                    }
                }
            }
        })

        res.send({ results: data })
    } catch (e){
        res.status(500).send({ error:e.message })
    }
})
/* END */

/* UPLOAD FILE */
app.post('/book/testUpload', (req, res) => {
    try {
        const myFile = req.files.myFile
        myFile.mv('./uploads/' + myFile.name, (err) => {
            if(err) {
                res.status(500).send({error: err})
            }
            res.send({message: 'success'})
        })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

/* READ FILE */
app.get('/readFile', (req, res) => {
    try {
        const fs = require('fs')
        fs.readFile('test.txt', (err, data) => {
            if(err) {
                throw err
            }

            res.send(data)
        })
    } catch (e) {
        res.status(500).send({error: e.message})
    }
})

/* WRITE FILE */
app.get('/writeFile', (req, res) => {
    try {
        const fs = require('fs')
        fs.writeFile('test.txt', 'Hello by phet', (err) => {
            if(err) {
                throw err
            }
        })
        res.send({ message: 'success'})
    } catch (e) {
        res.status(500).send({error: e.message})
    }
})

/* REMOVE FILE */
app.get('/removeFile', (req, res) => {
    try {
        const fs = require('fs')
        fs.unlinkSync('test.txt')
        res.send({ message: 'success' })
    } catch(e) {
        res.status(500).send({error: e.message})
    }
})

/* CHECK  FILE */
app.get('/fileExists', (req, res) => {
    try {
        const fs = require('fs')
        const found = fs.existsSync('package.json')

        res.send({ found: found })
    } catch(e) {
        res.status(500).send({error: e.message})
    }
})
/* END */

/* PDFKIT */
app.get('/createPdf', (req, res) => {
    const PDFDocument = require('pdfkit')
    const fs = require('fs')
    const doc = new PDFDocument()

    doc.pipe(fs.createWriteStream('output.pdf'))
    doc
        .font('Kanit/Kanit-Medium.ttf')
        .fontSize(25)
        .text('สวัสดี ทดสอบภาษาไทย', 100, 100)  
    doc
        .addPage()
        .fontSize(25)
        .text('Here is some vactor graphic...', 100, 100)
    doc.end()

    res.send({message: 'success'})
})
/* END */

/* EXCEL */
app.get('/readExcel', async (req, res) => {
    try {
        const excel = require('exceljs')
        const wb = new excel.Workbook()
        await wb.xlsx.readFile('productExport.xlsx')
        const ws = wb.getWorksheet(1)

        /* 
            read array i = 0 
            read excel i = 1
        */

        for (let i = 1; i < ws.rowCount; i++) {
            const row = ws.getRow(i)

            const barcode = row.getCell(1).value
            const name = row.getCell(2).value
            const cost = row.getCell(3).value
            const sale = row.getCell(4).value 
            const send = row.getCell(5).value
            const unit = row.getCell(6).value
            const point = row.getCell(7).value
            const productTypeId = row.getCell(8).value

            console.log(barcode, name, cost, sale, send, unit, point, productTypeId)
        }  

        res.send({message: 'success'})
    } catch(e) {
        res.status(500).send({error: e.message})
    }
})
/* END */

app.listen(3001, ()=>{console.log('server running port 3001')})