import Database from 'better-sqlite3'
import { faker } from '@faker-js/faker'
import path from 'path'
import fs from 'fs'
import { applySchema } from './schema'

const NATIONALITIES = [
  'American', 'British', 'French', 'German', 'Japanese', 'Chinese',
  'Brazilian', 'Indian', 'Australian', 'Canadian', 'Mexican', 'Italian',
  'Spanish', 'Dutch', 'Swedish', 'Norwegian', 'Korean', 'Russian',
  'Argentine', 'South African',
]

const HOBBIES = [
  'Photography', 'Painting', 'Gaming', 'Hiking', 'Cooking', 'Reading',
  'Cycling', 'Swimming', 'Dancing', 'Yoga', 'Traveling', 'Music',
  'Writing', 'Gardening', 'Coding', 'Chess', 'Pottery', 'Singing',
  'Running', 'Fishing', 'Knitting', 'Woodworking', 'Rock Climbing',
  'Birdwatching', 'Skateboarding', 'Surfing', 'Archery', 'Meditation',
  'Drawing', 'Brewing', 'Origami', 'Calligraphy', 'Volunteering',
  'Astronomy', 'Caving', 'Paragliding', '3D Printing', 'Film Making',
  'Beekeeping', 'Leather Crafting',
]

const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'users.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
applySchema(db)

const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
if (count > 0) {
  console.log(`Database already has ${count} users — skipping seed.`)
  db.close()
  process.exit(0)
}

const insertUser = db.prepare(
  'INSERT INTO users (avatar, first_name, last_name, age, nationality) VALUES (?, ?, ?, ?, ?)'
)
const insertHobby = db.prepare(
  'INSERT OR IGNORE INTO user_hobbies (user_id, hobby) VALUES (?, ?)'
)

const seed = db.transaction(() => {
  for (let i = 1; i <= 2000; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const age = faker.number.int({ min: 18, max: 80 })
    const nationality = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)]
    const avatar = `https://i.pravatar.cc/100?u=${i}`

    const { lastInsertRowid } = insertUser.run(avatar, firstName, lastName, age, nationality)
    const userId = Number(lastInsertRowid)

    const numHobbies = Math.floor(Math.random() * 11)
    const shuffled = [...HOBBIES].sort(() => Math.random() - 0.5)
    for (let j = 0; j < numHobbies; j++) {
      insertHobby.run(userId, shuffled[j])
    }
  }
})

seed()
console.log('Seeded 2000 users successfully.')
db.close()
