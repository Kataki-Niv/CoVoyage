"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ApiError, getValidAuthToken } from "@/lib/api";
import {
  BackpackItem,
  clearBackpack,
  getBackpackItems,
  removeBackpackItem,
  updateBackpackItem,
} from "@/lib/essentialsApi";

function formatCurrency(amountCents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function EssentialsBagPageClient() {
  const [items, setItems] = useState<BackpackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingItemId, setPendingItemId] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  const loadBag = useCallback(async (showLoadingState = true) => {
    const token = getValidAuthToken();

    if (!token) {
      return;
    }

    if (showLoadingState) {
      setError("");
      setIsLoading(true);
    }

    try {
      setItems(await getBackpackItems(token));
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to load your essentials bag.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getValidAuthToken();
    let isMounted = true;

    if (!token) {
      return () => {
        isMounted = false;
      };
    }

    getBackpackItems(token)
      .then((loadedItems) => {
        if (isMounted) {
          setItems(loadedItems);
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.detail
              : "Unable to load your essentials bag.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const bagItems = useMemo(
    () =>
      items.filter(
        (item): item is BackpackItem & { product: NonNullable<BackpackItem["product"]> } =>
          Boolean(item.product),
      ),
    [items],
  );

  const subtotalCents = bagItems.reduce(
    (total, item) => total + item.line_total_cents,
    0,
  );
  const itemCount = bagItems.reduce((total, item) => total + item.quantity, 0);
  const summaryCurrency = bagItems[0]?.currency || "USD";

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = getValidAuthToken();

    if (!token) {
      return;
    }

    setError("");
    setStatusMessage("");
    setPendingItemId(itemId);

    try {
      const updatedItem = await updateBackpackItem(itemId, quantity, token);
      setItems((current) =>
        current.map((item) => (item.id === itemId ? updatedItem : item)),
      );
      setStatusMessage("Bag updated.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to update this essential.",
      );
    } finally {
      setPendingItemId("");
    }
  };

  const removeItem = async (itemId: string) => {
    const token = getValidAuthToken();

    if (!token) {
      return;
    }

    setError("");
    setStatusMessage("");
    setPendingItemId(itemId);

    try {
      await removeBackpackItem(itemId, token);
      setItems((current) => current.filter((item) => item.id !== itemId));
      setStatusMessage("Essential removed.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to remove this essential.",
      );
    } finally {
      setPendingItemId("");
    }
  };

  const handleClearBag = async () => {
    const token = getValidAuthToken();

    if (!token) {
      return;
    }

    setError("");
    setStatusMessage("");
    setIsClearing(true);

    try {
      await clearBackpack(token);
      setItems([]);
      setStatusMessage("Bag cleared.");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to clear your essentials bag.",
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AuthGuard>
      <main className="px-5 py-12 sm:px-8 lg:py-16">
        <section className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/46">
                CoVoyage Essentials
              </p>
              <h1 className="mt-4 font-serif text-5xl leading-tight text-white sm:text-6xl">
                My Essentials Planning Bag
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/64">
                Review the practical items you saved for your upcoming journey.
              </p>
            </div>
            <Link
              className="inline-flex h-11 w-fit items-center justify-center border border-[#f8f4ea]/70 bg-[#f8f4ea] px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#050505] transition-colors hover:border-white hover:bg-white"
              href="/shop"
            >
              Browse essentials
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-8 border border-white/10 bg-[#111] p-6 text-sm text-white/62">
              Loading your essentials bag...
            </div>
          ) : null}

          {error ? (
            <div className="mt-8 border border-[#d8b7aa]/28 bg-[#2a211d] p-5 text-sm leading-6 text-[#f8f4ea]">
              {error}
              <button
                className="ml-3 font-medium text-[#d8b7aa] underline-offset-4 hover:underline"
                onClick={() => loadBag()}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : null}

          {statusMessage ? (
            <div className="mt-8 border border-[#d8b7aa]/28 bg-[#2a211d] p-5 text-sm leading-6 text-[#f8f4ea]">
              {statusMessage}
            </div>
          ) : null}

          {!isLoading && !error && bagItems.length === 0 ? (
            <div className="mt-8 border border-white/10 bg-[#111] p-8 text-center">
              <h2 className="font-serif text-3xl text-white">
                Your bag is empty.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/62">
                Save a few useful travel essentials from the catalog, then come
                back here to review them.
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center justify-center bg-[#f8f4ea] px-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#050505] transition-colors hover:bg-white"
                href="/shop"
              >
                Browse essentials
              </Link>
            </div>
          ) : null}

          {bagItems.length > 0 ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="grid gap-4">
                {bagItems.map((item) => {
                  const product = item.product;
                  const isPending = pendingItemId === item.id;
                  const nextLowerQuantity = Math.max(1, item.quantity - 1);
                  const nextHigherQuantity = Math.min(99, item.quantity + 1);

                  return (
                    <article
                      className="grid gap-5 border border-white/10 bg-[#111] p-4 sm:grid-cols-[10rem_minmax(0,1fr)]"
                      key={item.id}
                    >
                      <Link
                        className="relative aspect-[4/3] overflow-hidden bg-[#151515] sm:aspect-square"
                        href={`/shop/${product.slug}`}
                      >
                        <Image
                          alt={product.imageAlt}
                          className="object-cover"
                          fill
                          sizes="160px"
                          src={product.image}
                        />
                      </Link>
                      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#d8b7aa]">
                            {product.category}
                          </p>
                          <Link
                            className="mt-2 block font-serif text-3xl leading-tight text-white hover:text-white/78"
                            href={`/shop/${product.slug}`}
                          >
                            {product.name}
                          </Link>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">
                            {product.description}
                          </p>
                          <p className="mt-3 text-sm font-medium text-white/72">
                            {product.price}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <div className="flex items-center border border-white/10 bg-black/22">
                            <button
                              aria-label={`Decrease ${product.name} quantity`}
                              className="grid h-10 w-10 place-items-center text-white/72 transition-colors hover:bg-white/10 disabled:text-white/24"
                              disabled={isPending || item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, nextLowerQuantity)}
                              type="button"
                            >
                              -
                            </button>
                            <span className="grid h-10 w-11 place-items-center border-x border-white/10 text-sm font-medium text-white">
                              {item.quantity}
                            </span>
                            <button
                              aria-label={`Increase ${product.name} quantity`}
                              className="grid h-10 w-10 place-items-center text-white/72 transition-colors hover:bg-white/10 disabled:text-white/24"
                              disabled={isPending || item.quantity >= 99}
                              onClick={() => updateQuantity(item.id, nextHigherQuantity)}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-white/50 underline-offset-4 hover:text-white hover:underline disabled:text-white/24"
                            disabled={isPending}
                            onClick={() => removeItem(item.id)}
                            type="button"
                          >
                            {isPending ? "Updating..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="border border-white/10 bg-[#151515] p-5 lg:sticky lg:top-28">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#d8b7aa]">
                  Planning Summary
                </p>
                <div className="mt-5 space-y-4 border-y border-white/10 py-5 text-sm text-white/62">
                  <div className="flex items-center justify-between gap-4">
                    <span>Items</span>
                    <span>{itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Estimated Price</span>
                    <span>{formatCurrency(subtotalCents, summaryCurrency)}</span>
                  </div>
                </div>
                <p className="mt-5 text-xs leading-6 text-white/46">
                  Checkout and payment are not connected for this MVP. This bag
                  keeps your travel essentials saved for planning.
                </p>
                <button
                  className="mt-5 inline-flex h-11 w-full items-center justify-center border border-white/20 px-5 text-xs font-medium uppercase tracking-[0.18em] text-white/72 transition-colors hover:border-white/40 hover:text-white disabled:opacity-50"
                  disabled={isClearing}
                  onClick={handleClearBag}
                  type="button"
                >
                  {isClearing ? "Clearing..." : "Clear bag"}
                </button>
              </aside>
            </div>
          ) : null}
        </section>
      </main>
    </AuthGuard>
  );
}

