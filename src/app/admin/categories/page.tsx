"use client";

import { useEffect, useState } from "react";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@/components/store/Icons";
import type { CategoryDTO } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", description: "" });

  const load = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        setLoading(false);
      });
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, id: editing.id, isActive: true }),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ slug: "", name: "", description: "" });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Catégories</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Organisez votre catalogue ({categories.length} catégories)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm({ slug: "", name: "", description: "" });
            setShowForm(true);
          }}
          className="admin-btn"
        >
          <IconPlus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="admin-card p-5">
          <h2 className="mb-4 font-semibold">
            {editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="admin-label">Nom</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="admin-label">Description</span>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="admin-input"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="admin-btn">
              <IconCheck size={16} /> Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="admin-btn-outline"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="admin-card">
        {loading ? (
          <div className="p-10 text-center text-neutral-500">Chargement...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Slug</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>
                    <code className="rounded bg-neutral-100 px-2 py-0.5 text-xs">
                      {c.slug}
                    </code>
                  </td>
                  <td className="text-neutral-500">{c.description}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(c);
                          setForm({
                            slug: c.slug,
                            name: c.name,
                            description: c.description ?? "",
                          });
                          setShowForm(true);
                        }}
                        className="rounded p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        className="rounded p-2 text-red-500 hover:bg-red-50"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}