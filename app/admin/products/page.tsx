"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { fetchProducts, fetchCategories } from "@/src/lib/api";
import type { Product, Category } from "@/src/types/product";
import { Button } from "@/src/components/ui/Button";
import { DataTable, type Column } from "@/src/components/admin/DataTable";
import { StatsCard } from "@/src/components/admin/StatsCard";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { useConfirm } from "@/src/components/admin/ConfirmDialog";
import { formatPrice, safeImage } from "@/src/lib/utils";
import { useToast } from "@/src/providers/ToastProvider";
import { adminFetcher } from "@/src/lib/admin-api";

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const { confirm, dialog } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleFilterChange = (updater: (prev: string) => string) => {
    setCategoryFilter(updater);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchProducts({ limit: 100 }),
      fetchCategories(),
    ])
      .then(([productsRes, cats]) => {
        if (active) { setProducts(productsRes.products); setCategories(cats); }
      })
      .catch(() => { if (active) addToast("Failed to load products", "error"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [addToast]);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }
    return result;
  }, [products, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (product: Product) => {
    const ok = await confirm(`Delete "${product.name}"?`, "This cannot be undone.", { confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminFetcher(`/products/${product.id}`, { method: "DELETE" });
      addToast("Product deleted successfully", "success");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete product", "error");
    }
  };

  const stockStats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => p.stock === "out-of-stock").length;
    const lowStock = products.filter((p) => p.stock === "low-stock").length;
    return { total, outOfStock, lowStock };
  }, [products]);

  const columns: Column<Product>[] = [
    {
      key: "image",
      label: "",
      render: (p) => (
        <img
          src={safeImage(p.images)}
          alt={p.name}
          className="w-10 h-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (p) => (
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{p.slug}</p>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (p) => (
        <div>
          <p className="font-medium">{formatPrice(p.price)}</p>
          {p.originalPrice && (
            <p className="text-xs text-zinc-400 line-through">{formatPrice(p.originalPrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (p) => {
        const labels: Record<string, string> = {
          "in-stock": "In Stock",
          "low-stock": "Low Stock",
          "out-of-stock": "Out of Stock",
        };
        return <StatusBadge status={labels[p.stock] || p.stock} />;
      },
    },
    {
      key: "category",
      label: "Category",
      render: (p) => <span className="text-sm text-zinc-600 dark:text-zinc-400">{p.category}</span>,
    },
    {
      key: "rating",
      label: "Rating",
      render: (p) => <span className="text-sm">{p.rating > 0 ? `${p.rating} \u2605` : "\u2014"}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/${p.slug}`}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Edit className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(p);
            }}
            className="p-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  const categoryOptions = useMemo(() => {
    const names = [...new Set(products.map((p) => p.category))];
    return names.map((name) => ({
      name,
      slug: categories.find((c) => c.name === name)?.slug || name.toLowerCase().replace(/\s+/g, "-"),
    }));
  }, [products, categories]);

  return (
    <div>
      {dialog}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">Products</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Products" value={stockStats.total} icon={Package} color="text-blue-500" index={0} />
        <StatsCard title="Low Stock" value={stockStats.lowStock} icon={AlertTriangle} color="text-amber-500" index={1} />
        <StatsCard title="Out of Stock" value={stockStats.outOfStock} icon={CheckCircle} color="text-red-500" index={2} />
      </div>

      {categoryOptions.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleFilterChange(() => "")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !categoryFilter
                ? "bg-primary text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {categoryOptions.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleFilterChange(() => cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat.name
                  ? "bg-primary text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={paginated}
        keyExtractor={(p) => p.id}
        searchable
        searchValue={search}
        onSearchChange={handleSearchChange}
        loading={loading}
        pagination={totalPages > 1 ? { page, totalPages, onPageChange: setPage } : undefined}
        mobileCard={(p) => (
          <div className="flex items-start gap-3">
            <img src={safeImage(p.images)} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{p.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium">{formatPrice(p.price)}</span>
                <StatusBadge status={{ "in-stock": "In Stock", "low-stock": "Low Stock", "out-of-stock": "Out of Stock" }[p.stock] || p.stock} />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{p.category}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link href={`/admin/products/${p.slug}`} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <Edit className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
