"use client";

import { useState, useEffect } from "react";
import Banner from "@leafygreen-ui/banner";
import Button from "@leafygreen-ui/button";
import styles from "./indexWarningBanner.module.css";

const IndexWarningBanner = () => {
  const [missingIndexes, setMissingIndexes] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const checkIndexes = async () => {
    try {
      const res = await fetch("/api/checkIndexes");
      const data = await res.json();
      setMissingIndexes(data.missing || []);
      setStatuses(data.statuses || {});
    } catch (err) {
      console.error("Failed to check indexes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIndexes();
  }, []);

  const handleCreateIndexes = async () => {
    setCreating(true);
    setCreateResult(null);
    try {
      const res = await fetch("/api/checkIndexes", { method: "POST" });
      const data = await res.json();
      setCreateResult(data.results);

      // Re-check after a short delay (indexes start building async)
      setTimeout(() => checkIndexes(), 2000);
    } catch (err) {
      console.error("Failed to create indexes:", err);
      setCreateResult([{ name: "all", status: "error", error: err.message }]);
    } finally {
      setCreating(false);
    }
  };

  if (loading || dismissed) return null;

  // Check for indexes that are still building
  const buildingIndexes = Object.entries(statuses)
    .filter(([, status]) => status !== "READY" && status !== "ready")
    .map(([name, status]) => ({ name, status }));

  if (missingIndexes.length === 0 && buildingIndexes.length === 0) return null;

  return (
    <div className={styles.bannerWrapper}>
      <Banner
        variant="warning"
        dismissible
        onClose={() => setDismissed(true)}
      >
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            {missingIndexes.length > 0 && (
              <p>
                <strong>Missing Atlas Search indexes:</strong>{" "}
                {missingIndexes.join(", ")}. Search functionality will not work
                until these indexes are created.
              </p>
            )}
            {buildingIndexes.length > 0 && (
              <p>
                <strong>Indexes still building:</strong>{" "}
                {buildingIndexes
                  .map((i) => `${i.name} (${i.status})`)
                  .join(", ")}
                . Search may not work until they finish.
              </p>
            )}
            {createResult && (
              <p className={styles.resultText}>
                {createResult.map((r, i) => (
                  <span key={i}>
                    {r.name}:{" "}
                    {r.status === "created"
                      ? "✅ Created (building…)"
                      : r.status === "already_exists"
                      ? "✅ Already exists"
                      : `❌ ${r.error}`}
                    {i < createResult.length - 1 ? " | " : ""}
                  </span>
                ))}
              </p>
            )}
          </div>
          {missingIndexes.length > 0 && (
            <Button
              variant="primary"
              size="small"
              disabled={creating}
              onClick={handleCreateIndexes}
              className={styles.createButton}
            >
              {creating ? (
                "Creating…"
              ) : (
                "Create Indexes"
              )}
            </Button>
          )}
        </div>
      </Banner>
    </div>
  );
};

export default IndexWarningBanner;
