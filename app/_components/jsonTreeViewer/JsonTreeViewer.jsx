"use client";

import { useCallback, useMemo, useState } from "react";
import styles from "./jsonTreeViewer.module.css";

const OID_HEX = /^[a-f0-9]{24}$/i;

function isJsonObject(v) {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    !(v instanceof Date)
  );
}

function extendedJsonHint(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value);
  if (keys.length !== 1) return null;
  if (value.$oid != null && typeof value.$oid === "string") {
    return { kind: "oid", text: value.$oid };
  }
  if (value.$date != null) {
    const d = value.$date;
    const iso =
      typeof d === "string"
        ? d
        : d instanceof Date
          ? d.toISOString()
          : new Date(d).toISOString();
    return { kind: "date", text: iso };
  }
  return null;
}

function QuotedKey({ name }) {
  return <span className={styles.key}>{JSON.stringify(name)}</span>;
}

function Punct({ ch }) {
  return <span className={styles.punct}>{ch}</span>;
}

function StringValue({ value, maxStringLength }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = value.length > maxStringLength;
  const payload =
    !needsTruncate || expanded
      ? value
      : `${value.slice(0, maxStringLength)}\u2026`;
  const text = JSON.stringify(payload);
  return (
    <span
      className={styles.string}
      title={needsTruncate && !expanded ? value : undefined}
      onClick={needsTruncate ? () => setExpanded((e) => !e) : undefined}
      style={needsTruncate ? { cursor: "pointer" } : undefined}
    >
      {text}
    </span>
  );
}

/** Object property or array element (array: no key, isArrayItem) */
function LeafRow({
  name,
  depth,
  isArrayItem,
  isLast,
  children,
}) {
  return (
    <div className={styles.row} style={{ paddingLeft: depth * 14 }}>
      {!isArrayItem && name != null && (
        <>
          <QuotedKey name={name} />
          <span className={styles.sep}> : </span>
        </>
      )}
      {children}
      {!isLast && <Punct ch="," />}
    </div>
  );
}

function ObjectIdValue({ oid }) {
  return <span className={styles.oid}>{`ObjectId('${oid}')`}</span>;
}

function ObjectIdLine({ name, oid, depth, isArrayItem, isLast }) {
  return (
    <LeafRow
      name={name}
      depth={depth}
      isArrayItem={isArrayItem}
      isLast={isLast}
    >
      <ObjectIdValue oid={oid} />
    </LeafRow>
  );
}

function ArrayBlock({
  name,
  value,
  depth,
  defaultExpandedDepth,
  maxStringLength,
  isArrayItem,
  isLast,
}) {
  const [open, setOpen] = useState(depth < defaultExpandedDepth);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const headerPad = depth * 14;
  const innerDepth = depth + 1;

  return (
    <>
      <div className={styles.row} style={{ paddingLeft: headerPad }}>
        <button
          type="button"
          className={styles.caretBtn}
          aria-expanded={open}
          aria-label={open ? "Collapse" : "Expand"}
          onClick={toggle}
        >
          <span className={`${styles.caret} ${open ? styles.caretOpen : ""}`} />
        </button>
        {!isArrayItem && name != null && (
          <>
            <QuotedKey name={name} />
            <span className={styles.sep}> : </span>
          </>
        )}
        {!open ? (
          <>
            <Punct ch="[" />
            <span className={styles.typeMuted}> … </span>
            <Punct ch="]" />
            {!isLast && <Punct ch="," />}
          </>
        ) : (
          <Punct ch="[" />
        )}
      </div>
      {open && (
        <div className={styles.children}>
          {value.map((item, i) => (
            <JsonTreeNode
              key={i}
              name={null}
              value={item}
              depth={innerDepth}
              defaultExpandedDepth={defaultExpandedDepth}
              maxStringLength={maxStringLength}
              isArrayItem
              isLast={i === value.length - 1}
            />
          ))}
          <div className={styles.row} style={{ paddingLeft: headerPad }}>
            <span className={styles.caretSpacer} aria-hidden />
            <Punct ch="]" />
            {!isLast && <Punct ch="," />}
          </div>
        </div>
      )}
    </>
  );
}

function ObjectBlock({
  name,
  value,
  depth,
  defaultExpandedDepth,
  maxStringLength,
  isArrayItem,
  isLast,
}) {
  const [open, setOpen] = useState(depth < defaultExpandedDepth);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const keys = Object.keys(value);
  const headerPad = depth * 14;
  const innerDepth = depth + 1;

  return (
    <>
      <div className={styles.row} style={{ paddingLeft: headerPad }}>
        <button
          type="button"
          className={styles.caretBtn}
          aria-expanded={open}
          aria-label={open ? "Collapse" : "Expand"}
          onClick={toggle}
        >
          <span className={`${styles.caret} ${open ? styles.caretOpen : ""}`} />
        </button>
        {!isArrayItem && name != null && (
          <>
            <QuotedKey name={name} />
            <span className={styles.sep}> : </span>
          </>
        )}
        {!open ? (
          <>
            <Punct ch="{" />
            <span className={styles.typeMuted}> … </span>
            <Punct ch="}" />
            {!isLast && <Punct ch="," />}
          </>
        ) : (
          <Punct ch="{" />
        )}
      </div>
      {open && (
        <div className={styles.children}>
          {keys.length === 0 ? null : (
            keys.map((k, i) => (
              <JsonTreeNode
                key={k}
                name={k}
                value={value[k]}
                depth={innerDepth}
                defaultExpandedDepth={defaultExpandedDepth}
                maxStringLength={maxStringLength}
                isArrayItem={false}
                isLast={i === keys.length - 1}
              />
            ))
          )}
          <div className={styles.row} style={{ paddingLeft: headerPad }}>
            <span className={styles.caretSpacer} aria-hidden />
            <Punct ch="}" />
            {!isLast && <Punct ch="," />}
          </div>
        </div>
      )}
    </>
  );
}

function JsonTreeNode({
  name,
  value,
  depth,
  defaultExpandedDepth,
  maxStringLength,
  isRoot,
  isArrayItem = false,
  isLast = true,
}) {
  const ext = extendedJsonHint(value);
  if (ext?.kind === "oid") {
    return (
      <ObjectIdLine
        name={name}
        oid={ext.text}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      />
    );
  }
  if (ext?.kind === "date") {
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <StringValue value={ext.text} maxStringLength={maxStringLength} />
      </LeafRow>
    );
  }

  if (value === null) {
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <span className={styles.nullish}>null</span>
      </LeafRow>
    );
  }
  if (value === undefined) {
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <span className={styles.nullish}>undefined</span>
      </LeafRow>
    );
  }

  if (typeof value === "boolean") {
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <span className={styles.bool}>{JSON.stringify(value)}</span>
      </LeafRow>
    );
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <span className={styles.number}>{String(value)}</span>
      </LeafRow>
    );
  }
  if (typeof value === "number") {
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <span className={styles.string}>{JSON.stringify(value)}</span>
      </LeafRow>
    );
  }
  if (typeof value === "string") {
    const asOid =
      (name === "_id" || name === "id") && OID_HEX.test(value) ? value : null;
    if (asOid) {
      return (
        <ObjectIdLine
          name={name}
          oid={asOid}
          depth={depth}
          isArrayItem={isArrayItem}
          isLast={isLast}
        />
      );
    }
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <StringValue value={value} maxStringLength={maxStringLength} />
      </LeafRow>
    );
  }

  if (value instanceof Date) {
    return (
      <LeafRow
        name={name}
        depth={depth}
        isArrayItem={isArrayItem}
        isLast={isLast}
      >
        <StringValue
          value={value.toISOString()}
          maxStringLength={maxStringLength}
        />
      </LeafRow>
    );
  }

  if (Array.isArray(value)) {
    if (isRoot && name === null) {
      return (
        <ArrayBlock
          name={null}
          value={value}
          depth={0}
          defaultExpandedDepth={defaultExpandedDepth}
          maxStringLength={maxStringLength}
          isArrayItem={false}
          isLast
        />
      );
    }
    return (
      <ArrayBlock
        name={name}
        value={value}
        depth={depth}
        defaultExpandedDepth={defaultExpandedDepth}
        maxStringLength={maxStringLength}
        isArrayItem={isArrayItem}
        isLast={isLast}
      />
    );
  }

  if (typeof value === "object" && value !== null) {
    if (isRoot && name === null && isJsonObject(value)) {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return (
          <div className={styles.row} style={{ paddingLeft: 8 }}>
            <Punct ch="{" />
            <Punct ch="}" />
          </div>
        );
      }
      return (
        <ObjectBlock
          name={null}
          value={value}
          depth={0}
          defaultExpandedDepth={defaultExpandedDepth}
          maxStringLength={maxStringLength}
          isArrayItem={false}
          isLast
        />
      );
    }
    return (
      <ObjectBlock
        name={name}
        value={value}
        depth={depth}
        defaultExpandedDepth={defaultExpandedDepth}
        maxStringLength={maxStringLength}
        isArrayItem={isArrayItem}
        isLast={isLast}
      />
    );
  }

  return (
    <LeafRow
      name={name}
      depth={depth}
      isArrayItem={isArrayItem}
      isLast={isLast}
    >
      <span className={styles.string}>{JSON.stringify(String(value))}</span>
    </LeafRow>
  );
}

export default function JsonTreeViewer({
  data,
  className = "",
  defaultExpandedDepth = 2,
  maxStringLength = 100,
  showCopy = true,
  /** When true, do not scroll inside the viewer; outer container owns scrolling */
  fillParent = false,
}) {
  const safeData = data === undefined ? null : data;
  const jsonText = useMemo(() => {
    try {
      if (data === undefined) return "";
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  const copy = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(jsonText);
    }
  }, [jsonText]);

  return (
    <div
      className={`${styles.wrap} ${fillParent ? styles.wrapFillParent : ""} ${className}`.trim()}
    >
      {showCopy && (
        <button
          type="button"
          className={styles.copyBtn}
          onClick={copy}
          title="Copy JSON to clipboard"
          aria-label="Copy JSON to clipboard"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      )}
      <div className={styles.tree}>
        <JsonTreeNode
          name={null}
          value={safeData}
          depth={0}
          defaultExpandedDepth={defaultExpandedDepth}
          maxStringLength={maxStringLength}
          isRoot
        />
      </div>
    </div>
  );
}
