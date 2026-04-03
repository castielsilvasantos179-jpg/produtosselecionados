/**
 * checkout-pix.js
 * Script de ponte para iniciar o checkout em páginas separadas
 */

window.MLCheckout = {
    open: function(data) {
        // Salvar dados iniciais do produto no LocalStorage
        const state = {
            productName: data.productName,
            amount: data.amount,
            productImg: data.productImg,
            items: data.items || [{ name: data.productName, quantity: 1, unit_price: data.amount }],
            customer: {
                name: '', email: '', phone: '', cpf: '', zipcode: '',
                address: '', number: '', neighborhood: '', city: '', state: ''
            },
            pixCode: '',
            transactionId: ''
        };
        
        localStorage.setItem('ml_checkout_state', JSON.stringify(state));
        
        // Redirecionar para a primeira página do checkout
        // Detectar se estamos em uma subpasta (como /camera/) ou na raiz
        const path = window.location.pathname;
        const isSubfolder = path.includes('/camera/') || path.includes('/ventilador/') || path.includes('/climatizador/') || path.includes('/maquinasolda/') || path.includes('/panela/') || path.includes('/parafusadeira/') || path.includes('/poltrona/') || path.includes('/wap/');
        
        const checkoutPath = isSubfolder ? '../checkout/identificacao.html' : 'checkout/identificacao.html';
        
        window.location.href = checkoutPath;
    }
};
