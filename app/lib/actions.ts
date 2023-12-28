'use server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
export async function createInvoice(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFormData = CreateInvoice.parse(rawFormData);
  const amountInCents = validatedFormData.amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
      INSERT INTO invoices (
        customer_id,
        amount,
        status,
        date
      ) VALUES (
        ${validatedFormData.customerId},
        ${amountInCents},
        ${validatedFormData.status},
        ${date}
      );
    `;
  } catch (error) {
    return { message: 'Database Error' };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFormData = CreateInvoice.parse(rawFormData);
  const amountInCents = validatedFormData.amount * 100;
  try {
    await sql`
     UPDATE invoices
     SET customer_id = ${validatedFormData.customerId}, amount = ${amountInCents}, status = ${validatedFormData.status}
     WHERE id = ${id};
   `;
  } catch (error) {
    return { message: 'Database Error' };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Not implemented');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id};`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Invoice deleted successfully' };
  } catch (error) {
    return { message: 'Database Error' };
  }
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['paid', 'pending']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
