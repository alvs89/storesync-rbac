import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SUPPLIER_CUSTOM_VALUE } from '../utils/suppliers';
import { filterSupplierCatalog, getSupplierCategories } from '../utils/supplierCategories';
import './purchaseSupplierFields.css';

// Disclosure panels use native inputs and buttons rather than placing interactive
// search fields inside a single-select listbox. Tab works throughout; arrows move
// through results, Escape restores the trigger, and outside clicks close panels.
function Picker({ label, summary, disabled, children, invalid, describedBy }) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  return <div className="purchase-picker" ref={root} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(); }
    if (open && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const controls = [...root.current.querySelectorAll('[data-picker-option]')];
      if (!controls.length || (event.target.tagName === 'INPUT' && !['ArrowDown', 'ArrowUp'].includes(event.key))) return;
      event.preventDefault();
      const current = controls.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : event.key === 'ArrowDown' ? (current + 1) % controls.length : (current <= 0 ? controls.length - 1 : current - 1);
      controls[next].focus();
    }
  }}>
    <button type="button" ref={trigger} className="purchase-picker-trigger" disabled={disabled} aria-expanded={open} aria-controls={id} aria-label={label} aria-invalid={invalid || undefined} aria-describedby={describedBy} onClick={() => setOpen(value => !value)}>
      <span>{summary}</span><ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && <div id={id} role="group" aria-label={label} className="purchase-picker-panel">{children(close)}</div>}
  </div>;
}

export function PurchaseSupplierFields({ catalog, selected, onCategoriesChange, supplierName, supplierMode, onSupplierChange, disabled, loading, error, conflict }) {
  const [categorySearch, setCategorySearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const statusId = useId();
  const categories = useMemo(() => getSupplierCategories(catalog), [catalog]);
  const matches = useMemo(() => filterSupplierCatalog(catalog, error ? [] : selected), [catalog, selected, error]);
  const results = useMemo(() => filterSupplierCatalog(catalog, error ? [] : selected, supplierSearch), [catalog, selected, supplierSearch, error]);
  return <div className="purchase-supplier-discovery">
    <div className="purchase-field-label text-xs font-bold text-slate-700">Supplier Categories</div>
    <Picker label="Supplier Categories" summary={selected.length ? `${selected.length} categor${selected.length === 1 ? 'y' : 'ies'} selected` : 'All categories'} disabled={disabled || loading || Boolean(error)} describedBy={statusId}>
      {() => <>
        <Input aria-label="Search supplier categories" placeholder="Search categories" value={categorySearch} onChange={event => setCategorySearch(event.target.value)} />
        <div className="purchase-picker-results">
          {categories.filter(category => category.toLowerCase().includes(categorySearch.trim().toLowerCase())).map(category => <label className="purchase-category-option" key={category}>
            <input type="checkbox" data-picker-option checked={selected.includes(category)} onChange={() => onCategoriesChange(selected.includes(category) ? selected.filter(value => value !== category) : [...selected, category])} />
            <span>{category}</span>
          </label>)}
          {!categories.some(category => category.toLowerCase().includes(categorySearch.trim().toLowerCase())) && <p className="purchase-picker-note">No categories found.</p>}
        </div>
        <Button type="button" variant="ghost" size="sm" disabled={!selected.length} onClick={() => onCategoriesChange([])}>Clear selection</Button>
      </>}
    </Picker>
    {selected.length > 0 && <div className="purchase-category-chips">
      {selected.length <= 2 && selected.map(category => <button type="button" key={category} disabled={disabled} className="purchase-category-chip" aria-label={`Remove ${category}`} onClick={() => onCategoriesChange(selected.filter(value => value !== category))}>{category}<X size={12} aria-hidden="true" /></button>)}
      <button type="button" disabled={disabled} className="purchase-filter-clear" onClick={() => onCategoriesChange([])}>Clear selection</button>
    </div>}
    <p id={statusId} role="status" aria-live="polite" className="purchase-picker-note">
      {loading ? 'Loading supplier categories…' : error ? 'Supplier categories unavailable. You can still select a supplier without filtering.' : selected.length ? matches.length ? `${matches.length} supplier${matches.length === 1 ? '' : 's'} match ${selected.length} selected categor${selected.length === 1 ? 'y' : 'ies'}.` : 'No suppliers match the selected categories.' : 'Filter suppliers by the materials in this branch’s inventory.'}
    </p>
    <div className="purchase-field-label text-xs font-bold text-slate-700">Supplier <span className="text-red-600">*</span></div>
    <Picker label="Supplier" summary={supplierMode === 'custom' ? 'Other supplier / not listed' : supplierName || 'Select supplier'} disabled={disabled} invalid={conflict} describedBy={statusId}>
      {close => <>
        <Input aria-label="Search suppliers" placeholder="Search suppliers" value={supplierSearch} onChange={event => setSupplierSearch(event.target.value)} />
        <div className="purchase-picker-results">
          {results.map(supplier => <button type="button" data-picker-option className="purchase-supplier-option" key={supplier.name} aria-pressed={supplierMode !== 'custom' && supplierName === supplier.name} onClick={() => { onSupplierChange(supplier.name); close(); }}>
            <strong>{supplier.name}</strong><span>{supplier.categories.join(' • ') || 'No associated categories recorded'}</span>
          </button>)}
          {!results.length && <p className="purchase-picker-note">{matches.length ? 'No suppliers match your search.' : 'No suppliers match the selected categories.'} Clear the search or category selection, or choose Other below.</p>}
        </div>
        <button type="button" data-picker-option className="purchase-supplier-option purchase-other-supplier" aria-pressed={supplierMode === 'custom'} onClick={() => { onSupplierChange(SUPPLIER_CUSTOM_VALUE); close(); }}>Other supplier / not listed</button>
      </>}
    </Picker>
    {conflict && <p role="alert" className="purchase-supplier-conflict">{supplierName} does not match the selected categories. Choose another supplier or clear the category selection. Your purchase details have been kept.</p>}
  </div>;
}
