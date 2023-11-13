/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';
import { nextTick } from 'process';

type Entry = {
  entryId: number;
  title: string;
  notes: string;
  photoUrl: string;
};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `SELECT * FROM "entries"`;

    const entries = await db.query(sql);

    res.status(201).json(entries.rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/entries', async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body as Partial<Entry>;

    if (!title || !notes || !photoUrl) {
      throw new ClientError(
        400,
        'title, notes, and photoUrl are required fields'
      );
    }

    const sql = `INSERT INTO "entries" ("title", "notes", "photoUrl")
                      VALUES ($1, $2, $3)
                      RETURNING *;`;

    const entry = await db.query<Entry>(sql, [title, notes, photoUrl]);
    res.json(entry.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    const { title, notes, photoUrl } = req.body as Partial<Entry>;

    if (!Number.isInteger(entryId) || !title || !notes || !photoUrl) {
      throw new ClientError(
        400,
        'entryId, title, notes, and photoUrl are required fields'
      );
    }

    const sql = `UPDATE "entries"
                    SET "title" = $1,
                        "notes" = $2,
                        "photoUrl" = $3
                    WHERE "entryId" = $4
                    RETURNING *;`;

    const entry = await db.query<Entry>(sql, [title, notes, photoUrl, entryId]);
    if (!entry) {
      throw new ClientError(404, `entryId: ${entryId} not found.`);
    }
    res.status(201).json(entry.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
