export type UnsavedEntry = {
  title: string;
  notes: string;
  photoUrl: string;
};
export type Entry = UnsavedEntry & {
  entryId: number;
};

let data = {
  entries: [] as Entry[],
  nextEntryId: 1,
};

window.addEventListener('beforeunload', function () {
  const dataJSON = JSON.stringify(data);
  localStorage.setItem('code-journal-data', dataJSON);
});

const localData = localStorage.getItem('code-journal-data');
if (localData) {
  data = JSON.parse(localData);
}

export async function readEntries(): Promise<Entry[]> {
  const res = await fetch('/api/entries');
  if (!res.ok) throw new Error(`fetch Error: ${res.status}`);
  return await res.json();
}

export async function addEntry(entry: UnsavedEntry): Promise<Entry> {
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  };
  const res = await fetch('/api/entries', req);
  if (!res.ok) throw new Error(`fetch Error: ${res.status}`);
  return await res.json();
}

export async function updateEntry(entry: Entry): Promise<Entry> {
  const req = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  };
  const res = await fetch(`/api/entries/${entry.entryId}`, req);
  if (!res.ok) throw new Error(`fetch Error: ${res.status}`);
  return await res.json();
}

export async function removeEntry(entryId: number): Promise<void> {
  const req = {
    method: 'DELETE',
  };
  const res = await fetch(`/api/entries/${entryId}`, req);
  if (!res.ok) throw new Error(`fetch Error: ${res.status}`);
}
