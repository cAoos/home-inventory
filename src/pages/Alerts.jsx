import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, Clock, PackageMinus, CheckCheck } from "lucide-react";
import { Product, Alert } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import moment from "moment";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateAlerts = async (products) => {
    const existing = await Alert.list();
    const existingKeys = new Set(existing.map(a => a.product_id + "_" + a.type));
    const toCreate = [];

    products.forEach(p => {
      if (p.quantity <= (p.min_stock || 1) && !existingKeys.has(p.id + "_low_stock")) {
        toCreate.push({
          type: "low_stock",
          product_id: p.id,
          product_name: p.name,
          message: `${p.name} is running low (${p.quantity} ${p.unit} remaining, min: ${p.min_stock || 1})`,
          read: false,
          severity: p.quantity === 0 ? "high" : "medium",
        });
      }
      if (p.expiration_date && moment(p.expiration_date).isBefore(moment().add(7, "days")) && !existingKeys.has(p.id + "_expiring")) {
        const days = moment(p.expiration_date).diff(moment(), "days");
        toCreate.push({
          type: "expiring",
          product_id: p.id,
          product_name: p.name,
          message: days < 0 ? `${p.name} has expired!` : days === 0 ? `${p.name} expires today!` : `${p.name} expires in ${days} days`,
          read: false,
          severity: days <= 0 ? "high" : days <= 2 ? "high" : "medium",
        });
      }
    });

    await Promise.all(toCreate.map(a => Alert.create(a)));
    return Alert.list();
  };

  useEffect(() => {
    Product.list().then(products => generateAlerts(products)).then(a => {
      setAlerts(a.sort((x, y) => new Date(y.created_date) - new Date(x.created_date)));
      setLoading(false);
    });
  }, []);

  const markRead = async (id) => {
    await Alert.update(id, { read: true });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = async () => {
    await Promise.all(alerts.filter(a => !a.read).map(a => Alert.update(a.id, { read: true })));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const deleteAlert = async (id) => {
    await Alert.delete(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const unread = alerts.filter(a => !a.read).length;

  const severityColor = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
    low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
  };

  const typeIcon = {
    low_stock: PackageMinus,
    expiring: Clock,
    price_increase: AlertTriangle,
    budget_exceeded: AlertTriangle,
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <PageHeader title="Alerts" description={`${unread} unread alerts`}>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        )}
      </PageHeader>

      {alerts.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts" description="Alerts will appear here when products need attention" />
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const Icon = typeIcon[alert.type] || Bell;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-opacity ${severityColor[alert.severity] || severityColor.low} ${alert.read ? "opacity-60" : ""}`}
              >
                <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{alert.type.replace("_", " ")}</Badge>
                    <span className="text-xs opacity-70">{moment(alert.created_date).fromNow()}</span>
                    {!alert.read && <span className="w-2 h-2 rounded-full bg-current opacity-70" />}
                  </div>
                </div>
                <div className="flex gap-1">
                  {!alert.read && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markRead(alert.id)}>Read</Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 text-xs opacity-60" onClick={() => deleteAlert(alert.id)}>✕</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
