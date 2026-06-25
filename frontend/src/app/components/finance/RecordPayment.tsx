import { Upload, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

export function RecordPayment() {
  return (
    <div className="max-w-3xl">
      <h1>Record offline payment</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Recording a payment generates the student-visible receipt and updates dues.
      </p>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Payment details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Student</Label>
            <Select>
              <SelectTrigger className="mt-2"><SelectValue placeholder="Search by name or roll no…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Aisha Khan · MBBS-2022-041</SelectItem>
                <SelectItem value="b">Rohan Mehta · MBBS-2022-042</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Amount (₹)</Label>
              <Input placeholder="23500" className="mt-2" />
            </div>
            <div>
              <Label className="text-sm">Mode</Label>
              <Select>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Bank transfer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="dd">Demand draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Date</Label>
              <Input type="date" className="mt-2" />
            </div>
            <div>
              <Label className="text-sm">Reference / Txn ID</Label>
              <Input placeholder="MBBS-2022-041-T1Y3" className="mt-2" />
            </div>
          </div>
          <div>
            <Label className="text-sm">Receipt / proof</Label>
            <label className="mt-2 flex items-center gap-3 border border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/30 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm">Upload receipt PDF or image</div>
                <div className="text-xs text-muted-foreground">PNG, JPG, PDF up to 5MB</div>
              </div>
              <input type="file" className="hidden" />
            </label>
          </div>
          <div>
            <Label className="text-sm">Note</Label>
            <Textarea placeholder="Optional" className="mt-2" />
          </div>
          <Button onClick={() => toast.success("Payment recorded · receipt generated")}>
            Record payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
