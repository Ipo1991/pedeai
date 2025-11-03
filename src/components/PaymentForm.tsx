import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

function validCardNumber(num: string) {
  const s = num.replace(/\s+/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let digit = parseInt(s.charAt(i), 10);
    if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const PaymentSchema = Yup.object().shape({
  type: Yup.string().oneOf(['credit','debit','pix']).required('Selecione o tipo'),
  cardNumber: Yup.string().when('type', { is: (v:any)=>v!=='pix', then: Yup.string().required('Obrigatório').test('luhn','Número de cartão inválido', v=>v?validCardNumber(v):false)}),
  expiry: Yup.string().when('type', { is: (v:any)=>v!=='pix', then: Yup.string().required('Obrigatório').matches(/^(0[1-9]|1[0-2])\/ (?:[0-9]{2})$/, 'Formato MM/YY').test('exp','Cartão vencido', (val:any)=>{ if(!val) return false; const [mm,yy]=val.split('/'); const expiry=new Date(Number('20'+yy), Number(mm)-1+1,1); return expiry>new Date(); }) }),
  holderName: Yup.string().when('type',{is:(v:any)=>v!=='pix', then:Yup.string().required('Obrigatório')}),
  stateSigla: Yup.string().required('Obrigatório').oneOf(BR_STATES,'Sigla inválida')
});

export default function PaymentForm({ onSave }: { onSave: (data:any)=>void }) {
  const formik = useFormik({ initialValues:{ type:'credit', cardNumber:'', expiry:'', holderName:'', stateSigla:'' }, validationSchema: PaymentSchema, onSubmit: values=>onSave(values) });
  return null;
}