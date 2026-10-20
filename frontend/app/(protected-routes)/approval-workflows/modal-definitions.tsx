"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const modal = (
  <Dialog>
    <form>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Approval Workflow</DialogTitle>
          <DialogDescription>
            Submit a new request for approval across management levels.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="grid gap-4 py-2">
          <Field>
            <Label htmlFor="request">Request Title</Label>
            <Input id="request" name="request" required />
          </Field>

          <Field>
            <Label htmlFor="requester">Requester Name</Label>
            <Input id="requester" name="requester" required />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="price">Price (PHP)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="approvalLevel">Approval Level</Label>
              <Select name="approvalLevel" defaultValue="1">
                <SelectTrigger id="approvalLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 (Supervisor)</SelectItem>
                  <SelectItem value="2">Level 2 (Manager)</SelectItem>
                  <SelectItem value="3">Level 3 (Director)</SelectItem>
                  <SelectItem value="4">Level 4 (Executive)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="date">Request Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="status">Initial Status</Label>
              <Select name="status" defaultValue="Pending">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit">Create Workflow</Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
);
