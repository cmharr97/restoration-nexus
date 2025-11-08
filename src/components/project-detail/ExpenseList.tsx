import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/hooks/useExpenses';
import { Check, X, Receipt, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';

interface ExpenseListProps {
  projectId: string;
}

export default function ExpenseList({ projectId }: ExpenseListProps) {
  const { expenses, loading, updateExpenseStatus, deleteExpense, getReceiptUrl } = useExpenses(projectId);
  const { user } = useAuth();
  const { hasRole } = useOrganization();
  const isAdmin = hasRole(['owner', 'admin']);
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadReceiptUrls = async () => {
      const urls: Record<string, string> = {};
      for (const expense of expenses) {
        if (expense.receipt_url) {
          const url = await getReceiptUrl(expense.receipt_url);
          if (url) urls[expense.id] = url;
        }
      }
      setReceiptUrls(urls);
    };
    loadReceiptUrls();
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const approvedExpenses = expenses
    .filter((exp) => exp.status === 'approved')
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
  const pendingExpenses = expenses
    .filter((exp) => exp.status === 'pending')
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-3xl">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-success">
              ${approvedExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              ${pendingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>All expenses submitted for this project</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses submitted yet
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {expense.description || '—'}
                      </TableCell>
                      <TableCell>
                        {expense.profiles?.full_name || expense.profiles?.email}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            expense.status === 'approved'
                              ? 'default'
                              : expense.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.receipt_url && receiptUrls[expense.id] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={receiptUrls[expense.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Receipt className="h-4 w-4 mr-1" />
                              View
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {expense.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateExpenseStatus(expense.id, 'approved')}
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4 text-success" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateExpenseStatus(expense.id, 'rejected')}
                                  title="Reject"
                                >
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteExpense(expense.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
