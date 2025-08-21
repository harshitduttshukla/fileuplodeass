import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../models/db.js';
import { parseCSVToJson } from '../services/parser.js';

async function parseAndUpdateProgress({ id, filepath, mimetype }) {
  let parsed = [];
  const ext = path.extname(filepath).toLowerCase();

  if (mimetype?.includes('csv') || ext === '.csv') {
    const rows = await parseCSVToJson(filepath);
    const total = rows.length || 1;
    for (let i = 0; i < rows.length; i++) {
      parsed.push(rows[i]);
      if (i % 10 === 0 || i === total - 1) {
        const percent = Math.round(((i + 1) / total) * 100);
        await pool.query('UPDATE files SET progress=$1 WHERE id=$2', [percent, id]);
      }
    }
  } else if (mimetype?.includes('spreadsheetml.sheet') || ext === '.xlsx') {
    const wb = XLSX.readFile(filepath);
    const sh = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sh, { defval: '' });
    const total = rows.length || 1;
    for (let i = 0; i < rows.length; i++) {
      parsed.push(rows[i]);
      if (i % 10 === 0 || i === total - 1) {
        const percent = Math.round(((i + 1) / total) * 100);
        await pool.query('UPDATE files SET progress=$1 WHERE id=$2', [percent, id]);
      }
    }
  } else {
    throw new Error('Unsupported file type');
  }

  await pool.query(
    'UPDATE files SET parsed_content=$1, status=$2, progress=$3 WHERE id=$4',
    [JSON.stringify(parsed), 'ready', 100, id]
  );
}

export async function uploadFile(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'file is required (field: file)' });

  const id = uuidv4();

  try {
    await pool.query(
      'INSERT INTO files(id, filename, filepath, mimetype, status, progress) VALUES($1,$2,$3,$4,$5,$6)',
      [id, file.originalname, file.path, file.mimetype, 'processing', 0]
    );

    // fire & forget
    parseAndUpdateProgress({ id, filepath: file.path, mimetype: file.mimetype })
      .catch(async (err) => {
        console.error('Processing failed:', err);
        await pool.query('UPDATE files SET status=$1, progress=$2 WHERE id=$3', ['failed', 100, id]);
      });

    res.status(202).json({ file_id: id, status: 'processing', progress: 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save file' });
  }
}



export async function getFileProgress(req, res) {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT id,status,progress FROM files WHERE id=$1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const f = rows[0];
  res.json({ file_id: f.id, status: f.status, progress: f.progress });
}



export async function getFile(req, res) {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM files WHERE id=$1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const f = rows[0];
  if (f.status !== 'ready') return res.status(202).json({ message: 'Processing in progress' });
  res.json({ file_id: f.id, filename: f.filename, content: f.parsed_content });
}



export async function getFiles(_req, res) {
  const { rows } = await pool.query('SELECT id,filename,status,created_at FROM files ORDER BY created_at DESC');
  res.json(rows);
}



export async function deleteFile(req, res) {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT filepath FROM files WHERE id=$1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });

  const filepath = rows[0].filepath;
  await pool.query('DELETE FROM files WHERE id=$1', [id]);

  if (filepath && fs.existsSync(filepath)) {
    try { fs.unlinkSync(filepath); } catch {}
  }
  res.json({ ok: true });
}

