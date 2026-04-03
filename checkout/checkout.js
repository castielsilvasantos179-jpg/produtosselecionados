/**
 * checkout.js
 * Lógica compartilhada para o checkout em múltiplas páginas
 */

const Checkout = {
    // ─── ESTADO ──────────────────────────────────────────────────────────────
    getState: function() {
        const saved = localStorage.getItem('ml_checkout_state');
        if (saved) return JSON.parse(saved);
        return {
            productName: '',
            amount: 0,
            productImg: '',
            items: [],
            customer: {
                name: '',
                email: '',
                phone: '',
                cpf: '',
                zipcode: '',
                address: '',
                number: '',
                neighborhood: '',
                city: '',
                state: ''
            },
            pixCode: '',
            transactionId: ''
        };
    },

    saveState: function(state) {
        localStorage.setItem('ml_checkout_state', JSON.stringify(state));
    },

    updateCustomer: function(data) {
        const state = this.getState();
        state.customer = { ...state.customer, ...data };
        this.saveState(state);
    },

    // ─── UI ──────────────────────────────────────────────────────────────────
    formatCurrency: function(v) {
        return (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    renderSummary: function() {
        const state = this.getState();
        const subtotalEl = document.getElementById('ml-sum-subtotal');
        const totalEl = document.getElementById('ml-sum-total');
        const nameEl = document.getElementById('ml-sum-product-name');
        const imgEl = document.getElementById('ml-sum-product-img');

        if (subtotalEl) subtotalEl.textContent = this.formatCurrency(state.amount);
        if (totalEl) totalEl.textContent = this.formatCurrency(state.amount);
        if (nameEl) nameEl.textContent = state.productName;
        
        if (imgEl && state.productImg) {
            let imgSrc = state.productImg;
            if (!imgSrc.startsWith('http')) {
                // Limpar o caminho: remover ../ iniciais e garantir que comece com o caminho correto da raiz
                let cleanPath = imgSrc.replace(/^(\.\.\/)+/, '');
                imgSrc = '../' + cleanPath;
            }
            imgEl.src = imgSrc;
            
            // Fallback para erro de imagem
            imgEl.onerror = function() {
                console.error('Erro ao carregar imagem:', imgSrc);
                this.src = 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__large_plus.png';
                this.style.objectFit = 'contain';
                this.style.padding = '10px';
                this.style.opacity = '0.5';
            };
        }
    },

    renderStepSummaries: function(currentStep) {
        const state = this.getState();
        
        // Sumário Identificação (Step 1)
        if (currentStep > 1) {
            const sum1 = document.getElementById('ml-step-summary-1');
            if (sum1) {
                sum1.innerHTML = `
                    <div class="ml-step-summary">
                        <div class="ml-step-summary-data">
                            <b>${state.customer.name}</b>
                            ${state.customer.email}<br>
                            ${state.customer.phone}
                        </div>
                        <a href="identificacao.html" class="ml-card-edit">Editar</a>
                    </div>
                `;
                sum1.classList.remove('hidden');
                const content1 = document.getElementById('ml-step-content-1');
                if (content1) content1.classList.add('hidden');
            }
        }

        // Sumário Entrega (Step 2)
        if (currentStep > 2) {
            const sum2 = document.getElementById('ml-step-summary-2');
            if (sum2) {
                sum2.innerHTML = `
                    <div class="ml-step-summary">
                        <div class="ml-step-summary-data">
                            <b>Endereço de entrega</b>
                            ${state.customer.address}, ${state.customer.number}<br>
                            ${state.customer.neighborhood} - ${state.customer.city}/${state.customer.state}
                        </div>
                        <a href="entrega.html" class="ml-card-edit">Editar</a>
                    </div>
                `;
                sum2.classList.remove('hidden');
                const content2 = document.getElementById('ml-step-content-2');
                if (content2) content2.classList.add('hidden');
            }
        }
    },

    // ─── MÁSCARAS ────────────────────────────────────────────────────────────
    maskCPF: function(v) {
        v = v.replace(/\D/g, '');
        return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14);
    },
    maskPhone: function(v) {
        v = v.replace(/\D/g, '');
        if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
        return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').substring(0, 14);
    },
    maskCEP: function(v) {
        v = v.replace(/\D/g, '');
        return v.replace(/(\d{5})(\d{3})/, '$1-$2').substring(0, 9);
    },

    initMasks: function() {
        const phoneInput = document.getElementById('ml-input-phone');
        if (phoneInput) phoneInput.oninput = (e) => e.target.value = this.maskPhone(e.target.value);

        const cpfInput = document.getElementById('ml-input-cpf');
        if (cpfInput) cpfInput.oninput = (e) => e.target.value = this.maskCPF(e.target.value);

        const zipInput = document.getElementById('ml-input-zipcode');
        if (zipInput) {
            zipInput.oninput = (e) => {
                const val = this.maskCEP(e.target.value);
                e.target.value = val;
                if (val.length === 9) {
                    this.fetchAddress(val.replace('-', ''));
                }
            };
        }
    },

    fetchAddress: function(cep) {
        const addrInput = document.getElementById('ml-input-address');
        const neighInput = document.getElementById('ml-input-neighborhood');
        const cityInput = document.getElementById('ml-input-city');
        const stateInput = document.getElementById('ml-input-state');
        const numInput = document.getElementById('ml-input-number');

        if (!addrInput) return;

        addrInput.placeholder = 'Buscando...';
        
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (!data.erro) {
                    addrInput.value = data.logradouro;
                    neighInput.value = data.bairro;
                    cityInput.value = data.localidade;
                    stateInput.value = data.uf;
                    if (numInput) numInput.focus();
                }
                addrInput.placeholder = 'Rua, Avenida...';
            })
            .catch(() => {
                addrInput.placeholder = 'Rua, Avenida...';
            });
    },

    validateCPF: function(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let add = 0;
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10))) return false;
        return true;
    }
};

// Inicialização básica
document.addEventListener('DOMContentLoaded', () => {
    Checkout.renderSummary();
    Checkout.initMasks();
});
