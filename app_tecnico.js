// Scripts específicos para o painel do técnico

// Inicializa dropdown de configurações
$(document).ready(function() {
  $('.settings-dropdown').dropdown({
    action: 'hide',
    on: 'click'
  });
});

// Função para alternar o tema e salvar preferência no servidor
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  const logoLight = "/static/img/logo-light.png";
  const logoDark = "/static/img/logo-dark.png";
  $('.logo-container img').attr('src', isDark ? logoDark : logoLight);

  // Salva preferência no servidor
  const csrfToken = getCSRFToken();
  fetch('/set_theme/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrfToken
    },
    body: 'theme=' + (isDark ? 'dark' : 'light')
  });
}

// Evento para alternar tema
$(document).ready(function() {
  $('#toggle-theme').off('click').on('click', function(e){
    e.preventDefault();
    toggleTheme();
  });

  // Abrir modal de finalização
  $(document).on('click', '.finalizar-btn', function() {
    $('#finalizar-ordem-id').val($(this).data('ordem-id'));
    $('#finalizar-modal').modal('show');
  });

  // Abrir modal de cancelamento
  $(document).on('click', '.cancelar-btn', function() {
    $('#cancelar-ordem-id').val($(this).data('ordem-id'));
    $('#cancelar-modal').modal('show');
  });

  // Abrir modal de abrir OS
  $(document).off('click', '.abrir-os-btn').on('click', '.abrir-os-btn', function() {
    const referencia = $(this).data('referencia');
    const endereco   = $(this).data('endereco');
    const latitude   = $(this).data('latitude');
    const longitude  = $(this).data('longitude');

    $('#os-referencia').text(referencia);
    $('#os-form-descricao').val(referencia);
    $('#os-form-endereco').val(endereco);
    $('#os-form-latitude').val(latitude || '');
    $('#os-form-longitude').val(longitude || '');

    $('#abrir-os-modal').modal('show');
  });

  // Submissão do formulário de finalização via AJAX - MELHORADO
  $('#finalizar-form').off('submit').on('submit', function(e) {
    e.preventDefault();
    
    var $form = $(this);
    var $submitBtn = $form.find('button[type="submit"]');
    
    // Verificar se já está processando
    if ($submitBtn.hasClass('loading') || $submitBtn.prop('disabled') || $form.data('submitting')) {
      return false;
    }
    
    // Marcar como em processo de submissão
    $form.data('submitting', true);
    
    var formData = new FormData(this);
    
    // Adicionar loading e desabilitar botão
    $submitBtn.addClass('loading disabled').prop('disabled', true);
    $form.find('button').prop('disabled', true);
    
    $.ajax({
      url: '/ordens/finalizar/',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      timeout: 60000,
      success: function(response) {
        if (response && response.success) {
          location.reload();
        } else {
          // Remover loading em caso de erro
          $form.data('submitting', false);
          $submitBtn.removeClass('loading disabled').prop('disabled', false);
          $form.find('button').prop('disabled', false);
          alert(response.message || 'Erro ao finalizar chamado.');
        }
      },
      error: function(xhr, status, error) {
        // Remover loading em caso de erro
        $form.data('submitting', false);
        $submitBtn.removeClass('loading disabled').prop('disabled', false);
        $form.find('button').prop('disabled', false);
        
        if (status === 'timeout') {
          alert('Operação demorou muito para responder. Tente novamente.');
        } else {
          alert('Erro ao finalizar chamado.');
        }
      }
    });
  });

  // Submissão do formulário de cancelamento via AJAX - MELHORADO
  $('#cancelar-form').off('submit').on('submit', function(e) {
    e.preventDefault();
    
    var $form = $(this);
    var $submitBtn = $form.find('button[type="submit"]');
    
    // Verificar se já está processando
    if ($submitBtn.hasClass('loading') || $submitBtn.prop('disabled') || $form.data('submitting')) {
      return false;
    }
    
    // Marcar como em processo de submissão
    $form.data('submitting', true);
    
    var formData = new FormData(this);
    
    // Adicionar loading e desabilitar botão
    $submitBtn.addClass('loading disabled').prop('disabled', true);
    $form.find('button').prop('disabled', true);
    
    $.ajax({
      url: '/ordens/cancelar/',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      timeout: 30000,
      success: function(response) {
        if (response && response.success) {
          location.reload();
        } else {
          // Remover loading em caso de erro
          $form.data('submitting', false);
          $submitBtn.removeClass('loading disabled').prop('disabled', false);
          $form.find('button').prop('disabled', false);
          alert('Erro ao cancelar chamado.');
        }
      },
      error: function(xhr, status, error) {
        // Remover loading em caso de erro
        $form.data('submitting', false);
        $submitBtn.removeClass('loading disabled').prop('disabled', false);
        $form.find('button').prop('disabled', false);
        
        if (status === 'timeout') {
          alert('Operação demorou muito para responder. Tente novamente.');
        } else {
          alert('Erro ao cancelar chamado.');
        }
      }
    });
  });

  // Fechar modais ao clicar em cancelar
  $('#finalizar-modal .cancel, #cancelar-modal .cancel').on('click', function(){
    $(this).closest('.modal').modal('hide');
  });
});