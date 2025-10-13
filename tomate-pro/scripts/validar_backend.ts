#!/usr/bin/env node
import { hook } from "../sdk/ts/dist/index.js";
import { request } from "undici";

export default hook(async (ctx) => {
  const id = ctx.vars.pedido_id;
  if (!id) return ctx.assertFail("pedido_deletado", "pedido_id ausente");

  const base  = ctx.env("ORDERS_BASE_URL") || "https://api.exemplo.com/orders";
  const token = ctx.env("ORDERS_BEARER_TOKEN");
  if (!token) return ctx.assertFail("pedido_deletado", "ORDERS_BEARER_TOKEN ausente");

  const res = await request(`${base}/orders/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.statusCode >= 300) {
    return ctx.assertFail("pedido_deletado", `HTTP ${res.statusCode}`);
  }
  const body: any = await res.body.json();
  const existe = Array.isArray(body.items) && body.items.some((i:any)=> i.name === "Cartão Virtual");

  if (existe) return ctx.assertFail("pedido_deletado", "Item ainda presente");
  ctx.assertPass("pedido_deletado", `id=${id}`);
  ctx.log("Back-end confirmou a deleção");
});
