const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Persons = require('./models/persons')
require('dotenv').config()

const unknownEndPoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}

	next(error)
}

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('data', (req, res) => {
	return JSON.stringify(req.body)
})
app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms :data')
)

const date = new Date()

const persons = []

app.get('/api/persons', (request, response) => {
	Persons.find({})
		.then((person) => {
			response.json(person)
		})
		.catch((error) => {
			console.log('Error occurred while retrieving persons:', error)
			response.status(500).json({ error: 'Server error' })
		})
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
	Persons.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person)
			} else {
				response.status(404).end()
			}
		})
		.catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Persons.findByIdAndRemove(request.params.id)
		.then((result) => {
			response.status(204).end()
		})
		.catch((error) => next(error))
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

	const person = new Persons({
		name: body.name,
		number: body.number,
	})

	person.save().then((savedPerson) => response.json(savedPerson))
})

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Persons.findByIdAndUpdate(request.params.id, person, { new: true })
		.then((updatedPerson) => {
			response.json(updatedPerson)
		})
		.catch((error) => next(error))
})

app.use(unknownEndPoint)

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
