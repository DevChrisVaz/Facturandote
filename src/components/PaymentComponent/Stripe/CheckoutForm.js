import React, { useState, useEffect, useRef } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

import {
    Form, Button, Spinner, FormGroup, Label, Input, DropdownList,
    DropdownBtn, DropdownArrow, DropdownContent, DropdownItem, Error, StyledCardElement, RadioDiv, RadioLabel, Stripe
} from './PaymentElements';
import data from './cfdi.json';
// import useForm from '../../hooks/useFormPayment';
import { ValidateEmail, ValidateInfo, ValidateName, ValidatePhone, ValidateReason, ValidateRFC } from './ValidateInfo';
import productData from '../productSlider/ProductSliderData.json';
import File from '../components/inputFile/inputFile';
import { allowEmailCharacters, allowLettersOnly, blockSpecialCaracters, formatInput, limitPhone } from '../../validations';

export default function CheckoutForm({ id, submitForm, loading, payment, setPayment, response }) {
    const [product, setProduct] = useState([]);
    const [selected, setSelected] =  useState('Uso de CFDI');
    const [isActive, setIsActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cardElement, setCardElement] = useState(null);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState({});
    const [values, setValues] = useState({
        name: '',
        phone: '',
        rfc: '',
        reason: '',
        email: '',
        cfdi: '',
        file: [],
        product: '',
        price: ''
    });

    const inputName = useRef(null);
    const inputPhone = useRef(null);
    const inputRFC = useRef(null);
    const inputReason = useRef(null);
    const inputEmail = useRef(null);
    
    const stripe = useStripe();
    const elements = useElements();
    
    const updateUploadedFiles = (files) => setValues({ ...values, file: files});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(ValidateInfo(values));
        setIsSubmitting(true);
        setValues({ 
            ...values, 
            price: (product.pricePlusIVA * 100), 
            product: (product.type + ' ' + product.name + ' ' + product.content)
        });
        if(payment === '1'){
            setCardElement(elements.getElement(CardElement));
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement)
            });
            setError(error);
            setPaymentMethod(paymentMethod);
        }
    }
    
    const changePaymentMethod = (e) => {
        setPayment(e.target.value);
    }

    useEffect(() => {
        if(payment === '1'){
            if (Object.keys(errors).length === 0 && isSubmitting) {
                submitForm(values, error, paymentMethod, cardElement);
                setIsSubmitting(false);
            }
        }else{
            if (Object.keys(errors).length === 0 && isSubmitting) {
                submitForm(values);
            }
        }
    }, [errors, cardElement, values, isSubmitting, payment, paymentMethod, error, submitForm]);

    useEffect(() => {
        if(errors.name){
            inputName.current.addEventListener('change', () => {
                setErrors({ 
                    ...errors, 
                    name: ValidateName(values.name, errors.name)
                });
            })
        }
        if(errors.phone){
            inputPhone.current.addEventListener('change', () => {
                setErrors({ 
                    ...errors, 
                    phone: ValidatePhone(values.phone, errors.phone)
                });
            })
        }
        if(errors.rfc){
            inputRFC.current.addEventListener('change', () => {
                setErrors({ 
                    ...errors, 
                    rfc: ValidateRFC(values.rfc, errors.rfc)
                });
            })
        }
        if(errors.reason){
            inputReason.current.addEventListener('change', () => {
                setErrors({ 
                    ...errors, 
                    reason: ValidateReason(values.reason, errors.reason)
                });
            })
        }
        if(errors.email){
            inputEmail.current.addEventListener('change', () => {
                setErrors({ 
                    ...errors, 
                    email: ValidateEmail(values.email, errors.email)
                });
            })
        }
        if(errors.cfdi){
            if(values.cfdi) setErrors({ ...errors, cfdi: false })
        }
    }, [errors, values]);

    useEffect(() => {
        if (id.charAt(0) === 'e') {
            setProduct(productData.emision.find(el => el.id === id));
        } else if (id.charAt(0) === 't') {
            setProduct(productData.timbrado.find(el => el.id === id))
        }
    }, [id]);
    
    return (
        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label>Nombre</Label>
                <Input
                    id={'name'}
                    placeholder={'Nombre'}
                    name={'name'}
                    type={'text'}
                    value={values.name.replace(/\s+/g, ' ')}
                    onKeyPress={allowLettersOnly}
                    onChange={handleChange}
                    ref={inputName}
                />
                {errors.name && <Error>{errors.name}</Error>}
            </FormGroup>
            <FormGroup>
                <Label>Celular</Label>
                <Input
                    id={'phone'}
                    placeholder={'Celular'}
                    name={'phone'}
                    type={'number'}
                    onInput={limitPhone}
                    value={values.phone}
                    onChange={handleChange}
                    onKeyDown={formatInput}
                    ref={inputPhone}
                />
                {errors.phone && <Error>{errors.phone}</Error>}
            </FormGroup>
            <FormGroup>
                <Label>RFC</Label>
                <Input
                    id={'rfc'}
                    placeholder={'RFC'}
                    name={'rfc'}
                    type={'text'}
                    maxLength={'13'}
                    value={values.rfc.toUpperCase()} 
                    onKeyPress={blockSpecialCaracters}
                    onChange={handleChange}
                    ref={inputRFC}
                />
                {errors.rfc && <Error>{errors.rfc}</Error>}
            </FormGroup>
            <FormGroup>
                <Label>Razón Social</Label>
                <Input
                    id={'reason'}
                    placeholder={'Razón Social'}
                    name={'reason'}
                    type={'text'}
                    value={values.reason.replace(/\s+/g, ' ')} 
                    onChange={handleChange}
                    ref={inputReason}
                />
                {errors.reason && <Error>{errors.reason}</Error>}
            </FormGroup>
            <FormGroup>
                <Label>Correo</Label>
                <Input
                    id={'email'}
                    placeholder={'correo@dominio.com'}
                    name={'email'}
                    type={'text'}
                    value={values.email}
                    onKeyPress={allowEmailCharacters}
                    onChange={handleChange}
                    ref={inputEmail}
                />
                {errors.email && <Error>{errors.email}</Error>}
            </FormGroup>
            <FormGroup>
                <DropdownList >
                    <DropdownBtn onClick={e => setIsActive(!isActive)}>{selected}<DropdownArrow /></DropdownBtn>
                    {isActive && (
                        <DropdownContent>
                            {data.cfdi.map((option, index) => (
                                <DropdownItem key={index} onClick={(e) => { setSelected(option.content); setIsActive(false); setValues({ ...values, cfdi: option.id }); }}>{option.id} - {option.content}</DropdownItem>
                            ))}
                        </DropdownContent>
                    )}
                </DropdownList>
                {errors.cfdi && <Error>{errors.cfdi}</Error>}
            </FormGroup>
            <FormGroup>
                <Label>Seleccione su método de pago</Label>
                <RadioDiv>
                    <input
                        id='stripeMethod'
                        type='radio'
                        value='1'
                        checked={payment === '1' ? true : false}
                        onChange={changePaymentMethod}
                    />
                    <RadioLabel htmlFor='stripeMethod'><Stripe/> Stripe</RadioLabel>
                </RadioDiv>
                <RadioDiv>
                    <input
                        id='depositMethod'
                        type='radio'
                        value='2'
                        checked={payment === '2' ? true : false}
                        onChange={changePaymentMethod}
                    />
                    <RadioLabel htmlFor='depositMethod'>Depósito</RadioLabel>
                </RadioDiv>
            </FormGroup>
            {payment === '1' ?
            <div>
                <StyledCardElement 
                    options={{ style: { base: { color: '#fff' } } }} 
                />
                {response !== "Successful payment" && <Error style={{ marginBottom: '20px'}}>{response}</Error>}
            </div>
            : payment === '2' &&
            <FormGroup>
                <File 
                    accept={".pdf,.png,.jpeg,.jpg"} 
                    label={'Comprobante de pago'} 
                    updateFilesCb={updateUploadedFiles}
                />
                {errors.file && <Error>{errors.file}</Error>}
            </FormGroup>}
            <Button type='submit'>{loading ? <Spinner /> : "Comprar"}</Button>
        </Form>
    );
}