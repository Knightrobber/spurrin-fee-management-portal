import { motion } from "motion/react";
import { Download, Receipt, Copy, Building2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { paymentHistory, inr, currentDues, buildReceiptText, downloadFile } from "../../lib/mock";
import { useState } from "react";
import { toast } from "sonner";

export function StudentPayments() {
  const [copied, setCopied] = useState(false);
  const total = currentDues.breakup.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="max-w-6xl">
      <Tabs defaultValue="pay">
        <TabsList>
          <TabsTrigger value="pay">Make payment</TabsTrigger>
          <TabsTrigger value="history">Transaction history</TabsTrigger>
        </TabsList>

        <TabsContent value="pay" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Offline payment instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                    <Row label="Beneficiary" value="MedCollege Trust" />
                    <Row label="Bank" value="State Bank · Branch 0421" />
                    <Row label="Account no" value="404 1129 887 612" />
                    <Row label="IFSC" value="SBIN0000421" />
                    <Row
                      label="Reference"
                      value="MBBS-2022-041-T1Y3"
                      copyable
                      copied={copied}
                      onCopy={() => {
                        navigator.clipboard?.writeText("MBBS-2022-041-T1Y3");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Use the reference above so Finance can match your payment automatically.
                    The dashboard updates within 24 hours of Finance recording it.
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle>Amount due</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl text-primary">{inr(total)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentDues.termName} · Due {currentDues.dueDate}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-secondary/60">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-sm">Online payments coming soon</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll notify you when card and UPI payments are enabled. Use the bank
                      transfer details on the left in the meantime.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> All payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{p.id}</TableCell>
                      <TableCell className="text-sm">{p.date}</TableCell>
                      <TableCell className="text-sm">{p.term}</TableCell>
                      <TableCell className="text-sm">{p.mode}</TableCell>
                      <TableCell className="text-right text-sm">{inr(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            downloadFile(`${p.id}.txt`, buildReceiptText(p));
                            toast.success(`Receipt ${p.id} downloaded`);
                          }}
                        >
                          <Download className="w-3 h-3" /> Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({
  label,
  value,
  copyable,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm">{value}</span>
        {copyable && (
          <button
            onClick={onCopy}
            className="p-1 rounded hover:bg-background transition-colors"
            aria-label="copy"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
