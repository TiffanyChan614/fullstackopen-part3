const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const generateId = () => {
	const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0
	return maxId + 1
}

app.use(cors())
app.use(express.static('build'))

app.use(express.json())
morgan.token('data', (req, res) => {
	if (req.method === 'POST') {
		return JSON.stringify(req.body)
	}
	return ''
})
app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms :data')
)

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
]

const date = new Date()

app.get('/api/persons', (request, response) => {
	response.json(persons)
})

app.get('/api/info', (request, response) => {
	response.send(`
		<div>
			<p>
				Phonebook has info for ${persons.length}
				${persons.length > 1 ? 'people' : 'person'}
			</p>
            <p>
                ${date.toUTCString()}
            </p>
		</div>`)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find((person) => person.id === id)

	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter((person) => person.id != id)

	response.status(204).end()
})

app.post('/api/persons', (request, response) => {
	const body = request.body

	if (!body.name) {
		return response.status(400).json({
			error: 'name missing',
		})
	} else if (!body.number) {
		return response.status(400).json({
			error: 'number missing',
		})
	} else if (persons.find((p) => p.name === body.name) !== undefined) {
		return response.status(400).json({
			error: 'name must be unique',
		})
	}

	const person = {
		id: generateId(),
		name: body.name,
		number: body.number,
	}

	persons = persons.concat(person)

	response.json(person)
})

const unknownEndPoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndPoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
