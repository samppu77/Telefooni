import { useState, useEffect } from 'react'
import personService from './services/persons'
 
const Notification = ({ message }) => {
  if (message === null) {
    return null
  }
 
  return (
    <div className={message.type}>
      {message.text}
    </div>
  )
}
 
const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
 
  useEffect(() => {
    personService.getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])
 
  const showNotification = (text, type = 'success') => {
    setNotification({ text, type })
 
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }
 
  const addPerson = (event) => {
    event.preventDefault()
 
    const existingPerson = persons.find(
      person => person.name === newName
    )
 
    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )
 
      if (confirmUpdate) {
        const changedPerson = {
          ...existingPerson,
          number: newNumber
        }
 
        personService
          .update(existingPerson.id, changedPerson)
          .then(returnedPerson => {
            setPersons(
              persons.map(person =>
                person.id !== existingPerson.id
                  ? person
                  : returnedPerson
              )
            )
 
            setNewName('')
            setNewNumber('')
 
            showNotification(
              `Updated number for ${returnedPerson.name}`,
              'success'
            )
          })
          .catch(() => {
            showNotification(
              `Information of ${existingPerson.name} has already been removed from server`,
              'error'
            )
 
            setPersons(
              persons.filter(
                person => person.id !== existingPerson.id
              )
            )
          })
      }
 
      return
    }
 
    const personObject = {
      name: newName,
      number: newNumber
    }
 
    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
 
        showNotification(
          `Added ${returnedPerson.name}`,
          'success'
        )
      })
      .catch(error => {
        showNotification(
          error.response?.data?.error || 'Failed to add person',
          'error'
        )
      })
  }
 
  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(
            persons.filter(person => person.id !== id)
          )
 
          showNotification(
            `Deleted ${name}`,
            'success'
          )
        })
        .catch(() => {
          showNotification(
            `Information of ${name} has already been removed from server`,
            'error'
          )
 
          setPersons(
            persons.filter(person => person.id !== id)
          )
        })
    }
  }
 
  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )
 
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }
 
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
 
  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }
 
  return (
    <div>
      <h2>Phonebook</h2>
 
      <Notification message={notification} />
 
      <div>
        filter shown with:
        <input
          value={filter}
          onChange={handleFilterChange}
        />
      </div>
 
      <h3>add a new</h3>
 
      <form onSubmit={addPerson}>
        <div>
          name:
          <input
            value={newName}
            onChange={handleNameChange}
          />
        </div>
 
        <div>
          number:
          <input
            value={newNumber}
            onChange={handleNumberChange}
          />
        </div>
 
        <div>
          <button type="submit">add</button>
        </div>
      </form>
 
      <h2>Numbers</h2>
 
      {personsToShow.map(person => (
        <p key={person.id}>
          {person.name} {person.number}
          <button
            onClick={() => deletePerson(person.id, person.name)}
          >
            delete
          </button>
        </p>
      ))}
    </div>
  )
}
 
export default App