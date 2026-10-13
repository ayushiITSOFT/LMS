import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";
import { Skeleton } from "./Skeleton.jsx";

export function DataTable({
  columns,
  data = [],
  keyField = "id",
  emptyText = "No records found",
  loading = false,
  pageSize = 10,
  enablePagination = true,
  searchable = true,
  searchPlaceholder = "Search records...",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Handle Search Filtering
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((row) => {
      return columns.some((col) => {
        let val = "";
        if (col.accessor) {
          val = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
        }
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, columns]);

  // Handle Column Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  function handleSort(key) {
    if (!key) return;
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return { key: null, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  }

  // Pagination Math
  const totalItems = sortedData.length;
  const shouldPaginate = enablePagination && totalItems > pageSize;
  const totalPages = shouldPaginate ? Math.ceil(totalItems / pageSize) : 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = shouldPaginate ? (validPage - 1) * pageSize : 0;
  const paginatedData = shouldPaginate ? sortedData.slice(startIndex, startIndex + pageSize) : sortedData;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  if (loading) {
    return (
      <div className="table-wrapper card" style={{ padding: 0, overflow: "hidden" }}>
        {searchable && (
          <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border-color)", background: "var(--slate-50)" }}>
            <Skeleton height="36px" width="260px" />
          </div>
        )}
        <table className="data-table-ui">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((_, colIdx) => (
                  <td key={colIdx}>
                    <Skeleton height="18px" width="80%" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrapper card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Table Toolbar (Search Bar & Count) */}
      {searchable && (
        <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border-color)", background: "var(--slate-50)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <input
              type="text"
              className="input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: "2.25rem", paddingRight: searchQuery ? "2rem" : "0.85rem" }}
            />
            <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--slate-400)" }} />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--slate-400)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {searchQuery ? (
              <span>Showing {totalItems} matching of {data.length} records</span>
            ) : (
              <span>Total {data.length} records</span>
            )}
          </div>
        </div>
      )}

      {/* Table Main Render */}
      {!sortedData || sortedData.length === 0 ? (
        <div style={{ padding: "3.5rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <Inbox size={40} style={{ color: "var(--slate-300)" }} />
          <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-800)" }}>{searchQuery ? "No matching records found" : emptyText}</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "360px" }}>
            {searchQuery ? "Try searching with a different keyword or resetting active filters." : "There are currently no records available in this view."}
          </p>
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
              <RotateCcw size={14} />
              <span>Reset Search</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table-ui">
            <thead>
              <tr>
                {columns.map((col, i) => {
                  const sortKey = typeof col.accessor === "string" ? col.accessor : col.key;
                  const isSorted = sortConfig.key === sortKey;
                  const isSortable = col.sortable !== false && !!sortKey;

                  return (
                    <th
                      key={col.key || col.accessor || i}
                      style={{
                        ...col.style,
                        cursor: isSortable ? "pointer" : "default",
                        userSelect: "none",
                      }}
                      onClick={() => isSortable && handleSort(sortKey)}
                    >
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <span>{col.header}</span>
                        {isSortable && (
                          <span style={{ opacity: isSorted ? 1 : 0.4, color: isSorted ? "var(--primary)" : "inherit" }}>
                            {isSorted ? (
                              sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                            ) : (
                              <ArrowUpDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={row[keyField] || rowIndex}>
                  {columns.map((col, colIndex) => {
                    const val = col.accessor
                      ? typeof col.accessor === "function"
                        ? col.accessor(row)
                        : row[col.accessor]
                      : null;

                    return (
                      <td key={col.key || col.accessor || colIndex} style={col.style}>
                        {col.cell ? col.cell(row) : val !== undefined && val !== null ? String(val) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {shouldPaginate && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> entries
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={validPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-page-indicator">
              Page <strong>{validPage}</strong> of {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={validPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

