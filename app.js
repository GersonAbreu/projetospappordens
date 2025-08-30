// Objeto para armazenar inicializadores de página
const PageInitializers = {
    // Função para inicializar componentes comuns em todas as páginas
    common: function() {
      // inicializa dropdowns anexando o menu ao <body>
      $('.ui.dropdown').dropdown({
        context: $('body'),
        keepOnScreen: true
      });
      
      // Inicializa dropdown de configurações
      $('.settings-dropdown').dropdown({
        action: 'hide',
        on: 'click'
      });
      
      $('.ui.checkbox').checkbox();
      $('.ui.accordion').accordion();
      $('.ui.modal').modal({
        detachable: false,
        allowMultiple: true
      });
      
      // Configura tema
      $('#toggle-theme').off('click').on('click', function(e){
        e.preventDefault();
        
        // Toggle class on body
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
  
        // Update logo
        const logoLight = "/static/img/logo-light.png";
        const logoDark = "/static/img/logo-dark.png";
        $('.logo-container img').attr('src', isDark ? logoDark : logoLight);
  
        // Save on server
        const csrfToken = getCSRFToken();
        fetch('/set_theme/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken
          },
          body: 'theme=' + (isDark ? 'dark' : 'light')
        });
      });
    },
    
    // Inicializador para página de usuários/técnicos
    usuarios: function() {
      // Inicializa o dropdown
      $('.ui.dropdown').dropdown();
  
      // Inicializa validação do formulário
      $('#add-tecnico-form').form({
        fields: {
          username: 'empty',
          full_name: 'empty',
          email: 'email',
          password: ['minLength[6]', 'empty'],
          confirm_password: {
            identifier: 'confirm_password',
            rules: [
              { type: 'match[password]', prompt: 'As senhas não coincidem' }
            ]
          },
          grupo: 'empty'
        }
      });
    },

    // Inicializador para página da dashboard
    dashboard: function() {
      console.log('Inicializando dashboard...');
      
      // Verificar se jQuery está disponível
      if (typeof $ === 'undefined') {
        console.error('jQuery não está disponível!');
        return;
      }
      
      // Aguardar um pouco para garantir que o DOM esteja pronto
      setTimeout(function() {
        // Controle do seletor de data personalizada
        const dataPersonalizadaInput = $('#data-personalizada');
        
        // Verificar se o elemento foi encontrado
        if (dataPersonalizadaInput.length === 0) {
          console.error('Input de data não encontrado!');
          return;
        }
        
        // Verificar se o período atual é "personalizado"
        const urlParams = new URLSearchParams(window.location.search);
        const periodoAtual = urlParams.get('periodo');
        const dataPersonalizada = urlParams.get('data_personalizada');
        
        // Se houver data personalizada na URL, garantir que ela seja definida no input oculto
        if (dataPersonalizada) {
          console.log('Definindo data personalizada no input:', dataPersonalizada);
          dataPersonalizadaInput.val(dataPersonalizada);
        }
        
        // Controlar clique nos filtros de período
        $('.periodo-filters-simple .ui.button').off('click').on('click', function(e) {
          const href = $(this).attr('href');
          const periodo = href.split('=')[1];
          console.log('Botão clicado! Período:', periodo, 'Href:', href);
          
          // Se for "personalizado", abrir o popup do calendário diretamente
          if (periodo === 'personalizado') {
            e.preventDefault();
            
            // Atualizar estado visual dos botões
            $('.periodo-filters-simple .ui.button').removeClass('active');
            $(this).addClass('active');
            
            // Se não houver data selecionada, usar a data atual
            if (!dataPersonalizadaInput.val()) {
              const hoje = new Date().toISOString().split('T')[0];
              dataPersonalizadaInput.val(hoje);
            }
            
            // Método alternativo: criar um input temporário visível
            const tempInput = $('<input type="date" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; opacity: 1; padding: 10px; font-size: 16px; border: 2px solid #007bff; border-radius: 5px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">');
            tempInput.val(dataPersonalizadaInput.val());
            
            // Adicionar evento para capturar mudança de data
            tempInput.on('change', function() {
              const dataSelecionada = $(this).val();
              
              if (dataSelecionada) {
                // Atualizar o input oculto
                dataPersonalizadaInput.val(dataSelecionada);
                
                // Remover o input temporário imediatamente
                tempInput.remove();
                
                // Aplicar a data automaticamente
                const url = new URL(window.location);
                url.searchParams.set('periodo', 'personalizado');
                url.searchParams.set('data_personalizada', dataSelecionada);
                console.log('Redirecionando com data selecionada:', url.toString());
                window.location.href = url.toString();
              }
            });
            
            // Adicionar evento para quando perder o foco (clique fora)
            tempInput.on('blur', function() {
              // Remover o input temporário após um pequeno delay para permitir seleção
              setTimeout(function() {
                tempInput.remove();
              }, 300);
            });
            
            // Adicionar evento para tecla ESC
            tempInput.on('keydown', function(e) {
              if (e.key === 'Escape') {
                tempInput.remove();
              }
            });
            
            // Adicionar ao DOM temporariamente
            $('body').append(tempInput);
            
            // Focar e clicar no input temporário
            tempInput.focus().click();
            
            // Não remover automaticamente - deixar o usuário interagir
            // O input será removido apenas quando uma data for selecionada ou quando perder o foco
            
            // Também tentar o método original como backup
            setTimeout(function() {
              try {
                if (dataPersonalizadaInput[0].showPicker) {
                  dataPersonalizadaInput[0].showPicker();
                } else {
                  dataPersonalizadaInput[0].click();
                }
              } catch (error) {
                console.error('Método original falhou:', error);
              }
            }, 200);
            
            return;
          }
          
          // Para outros períodos, permitir o comportamento padrão (não prevenir)
          console.log('Permitindo redirecionamento para:', href);
        });
        
        // Aplicar data personalizada automaticamente quando a data for alterada
        dataPersonalizadaInput.off('change').on('change', function() {
          const dataSelecionada = $(this).val();
          console.log('Data alterada para:', dataSelecionada);
          
          if (dataSelecionada) {
            console.log('Aplicando data automaticamente:', dataSelecionada);
            
            // Garantir que o botão "Data Específica" esteja ativo
            $('.periodo-filters-simple .ui.button').removeClass('active');
            $('.periodo-filters-simple .ui.button[href="?periodo=personalizado"]').addClass('active');
            
            // Redirecionar automaticamente com a nova data
            const url = new URL(window.location);
            url.searchParams.set('periodo', 'personalizado');
            url.searchParams.set('data_personalizada', dataSelecionada);
            console.log('Redirecionando automaticamente para:', url.toString());
            window.location.href = url.toString();
          }
        });
        
        // Garantir que a data seja mantida quando a página for recarregada
        $(window).off('beforeunload').on('beforeunload', function() {
          const dataSelecionada = dataPersonalizadaInput.val();
          if (dataSelecionada) {
            // Salvar a data no localStorage para persistir
            localStorage.setItem('data_personalizada_temp', dataSelecionada);
          }
        });
        
        // Restaurar data do localStorage se existir
        const dataSalva = localStorage.getItem('data_personalizada_temp');
        if (dataSalva && periodoAtual === 'personalizado') {
          console.log('Restaurando data do localStorage:', dataSalva);
          dataPersonalizadaInput.val(dataSalva);
        }
        
        console.log('Dashboard inicializada com sucesso!');
      }, 100);
    }
  };
  
  // Detectar a página atual e chamar o inicializador apropriado
  function detectCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('/materiais/kits')) {
      return 'kits';
    } else if (path.includes('/locais')) {
      return 'locais';
    } else if (path.includes('/ordens')) {
      return 'ordens';
    } else if (path.includes('/usuarios')) {
      return 'usuarios';
    } else if (path === '/' || path === '/dashboard/') {
      return 'dashboard';
    }
    // Adicione mais casos conforme necessário
    
    return 'unknown';
  }
  
  // Função principal para inicializar a página atual
  function initializeCurrentPage() {
    // Sempre inicializa componentes comuns
    PageInitializers.common();
    
    // Detecta e inicializa componentes específicos da página
    const currentPage = detectCurrentPage();
    if (PageInitializers[currentPage]) {
      PageInitializers[currentPage]();
    }
    
    // Para páginas específicas, chama inicialização se existir
    if (currentPage === 'kits' && typeof window.KitsPage !== 'undefined') {
      window.KitsPage.init();
    }
    
    if (currentPage === 'locais' && typeof window.LocalsPage !== 'undefined') {
      window.LocalsPage.init();
    }
    
    if (currentPage === 'ordens' && typeof window.OrdensPage !== 'undefined') {
      window.OrdensPage.init();
    }
  }
  
  // Configura eventos globais delegados (vinculados ao documento)
  function setupGlobalEventHandlers() {
    
    // Evento para abrir modal de câmeras reparadas
    $(document).off('click', '.ver-cameras-reparadas-btn').on('click', '.ver-cameras-reparadas-btn', function() {
      const ordemId = $(this).data('ordem-id');
      
      // Configura o modal
      $('#cameras-reparadas-os-id').text(ordemId);
      $('#cameras-reparadas-loader').show();
      $('#cameras-reparadas-content').hide();
      
      // Configura o modal para não bloquear outros modals
      $('#cameras-reparadas-modal').modal({
        detachable: false,
        allowMultiple: true,
        onHide: function() {
          // Limpa o conteúdo quando o modal é fechado para evitar conflitos
          $('#cameras-reparadas-content').html('');
          return true;
        },
        onShow: function() {
          // Garante que o modal seja configurado corretamente
          $(this).modal('refresh');
        }
      }).modal('show');
      
      // Carrega o conteúdo via AJAX
      $.ajax({
        url: `/ordens/${ordemId}/cameras-reparadas/`,
        method: 'GET',
        success: function(data) {
          $('#cameras-reparadas-content').html(data);
          $('#cameras-reparadas-loader').hide();
          $('#cameras-reparadas-content').show();
          
          // Re-configura eventos específicos do modal de fotos dentro do contexto
          $('#cameras-reparadas-content').off('click', '.ver-foto-btn').on('click', '.ver-foto-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const url = $(this).data('foto-url');
            const titulo = $(this).data('camera-titulo') || 'Foto da Câmera';
            const numeroSerie = $(this).data('camera-sn') || 'N/A';
            const tituloCompleto = `${titulo} (SN: ${numeroSerie})`;
            $('#foto-modal .header').text('Foto - ' + tituloCompleto);
            $('#foto-modal-img').attr('src', url);

            // RESETAR ZOOM E ROTAÇÃO AO ABRIR QUALQUER FOTO
            fotoModalZoom = 1;
            fotoModalRotation = 0;
            fotoModalUrl = url;
            $('#foto-modal-img').css('transform', 'scale(1) rotate(0deg)')
              .attr('data-zoom', 1)
              .attr('data-rotation', 0);

            $('#foto-modal').modal({
              detachable: false,
              allowMultiple: true,
              onShow: function() {
                $(this).css('z-index', '1010');
              },
              onHide: function() {
                $(this).css('z-index', '');
                return true;
              }
            }).modal('show');
          });
        },
        error: function() {
          $('#cameras-reparadas-content').html('<div class="ui negative message">Erro ao carregar fotos das câmeras reparadas.</div>');
          $('#cameras-reparadas-loader').hide();
          $('#cameras-reparadas-content').show();
        }
      });
    });
    
    // Eventos para modais de usuários/técnicos
    $(document).off('click', '#add-tecnico-btn').on('click', '#add-tecnico-btn', function() {
      $('#add-tecnico-modal').modal('show');
    });
    
    $(document).off('click', '#add-tecnico-modal .cancel').on('click', '#add-tecnico-modal .cancel', function() {
      $('#add-tecnico-modal').modal('hide');
    });

    // Abrir modal para edição
    $(document).off('click', '.edit-tecnico-btn').on('click', '.edit-tecnico-btn', function() {
      const tecnicoId = $(this).data('id');
      // Limpa mensagens de erro
      $('#add-tecnico-form .ui.error.message').hide();
      // Busca dados do técnico via AJAX
      $.ajax({
        url: `/api/tecnico/${tecnicoId}/`,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
          $('#tecnico_id').val(data.id);
          $('input[name="username"]').val(data.username).prop('readonly', true);
          $('input[name="full_name"]').val(data.full_name);
          $('input[name="email"]').val(data.email);
          $('select[name="grupo"]').val(data.grupo).trigger('change');

          // Esconde campos de senha na edição
          $('input[name="password"], input[name="confirm_password"]').val('').closest('.field').hide();
          $('#add-tecnico-modal .header').text('Editar Técnico');
          $('#add-tecnico-form').attr('action', '/usuarios/adicionar/');
          $('#add-tecnico-modal').modal('show');
        },
        error: function() {
          alert('Erro ao carregar dados do técnico.');
        }
      });
    });

    // Ao abrir para novo técnico, mostra campos de senha
    $(document).off('click', '#add-tecnico-btn').on('click', '#add-tecnico-btn', function() {
      $('#tecnico_id').val('');
      $('input[name="username"]').prop('readonly', false);
      $('input[name="password"], input[name="confirm_password"]').closest('.field').show();
      $('#add-tecnico-modal .header').text('Novo Técnico');
      $('#add-tecnico-form').attr('action', '/usuarios/adicionar/');
    });

    // Botão de excluir técnico
    $(document).off('click', '.delete-tecnico-btn').on('click', '.delete-tecnico-btn', function() {
      const tecnicoId = $(this).data('id');
      const username = $(this).data('username');
      $('#delete-tecnico-id').val(tecnicoId);
      $('#delete-username').text(username);
      $('#delete-tecnico-modal').modal('show');
    });

    // Formulário de exclusão de técnico
    $(document).off('submit', '#delete-tecnico-form').on('submit', '#delete-tecnico-form', function(e) {
      e.preventDefault();
      const tecnicoId = $('#delete-tecnico-id').val();
      $.ajax({
        url: `/usuarios/excluir/${tecnicoId}/`,
        method: 'POST',
        data: {
          'csrfmiddlewaretoken': getCSRFToken()
        },
        success: function() {
          $('#delete-tecnico-modal').modal('hide');
          window.location.reload();
        },
        error: function() {
          alert('Erro ao excluir usuário.');
        }
      });
    });
    
    $(document).off('click', '#fechar-foto-modal').on('click', '#fechar-foto-modal', function() {
      $('#foto-modal').modal('hide');
    });

    // Evento para abrir modal de fotos do local
    $(document).off('click', '.ver-fotos-local-btn').on('click', '.ver-fotos-local-btn', function() {
      const ordemId = $(this).data('ordem-id');
      $('#fotos-local-loader').show();
      $('#fotos-local-content').hide();
      $('#fotos-local-modal').modal({
        detachable: false,
        allowMultiple: true,
        onHide: function() {
          $('#fotos-local-content').html('');
          return true;
        },
        onShow: function() {
          $(this).modal('refresh');
        }
      }).modal('show');
      // Carrega o conteúdo via AJAX
      $.ajax({
        url: `/ordens/${ordemId}/fotos-local/`,
        method: 'GET',
        success: function(data) {
          // data.html = cards, data.descricao = descrição completa
          $('#fotos-local-modal .header').text('Fotos do Local - ' + (data.descricao || ''));
          $('#fotos-local-content').html(data.html);
          $('#fotos-local-loader').hide();
          $('#fotos-local-content').show();
          // Evento para ampliar foto do local
          $('#fotos-local-content').off('click', '.ver-foto-local-btn').on('click', '.ver-foto-local-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const url = $(this).data('foto-url');
            const tipo = $(this).data('tipo-descricao') || 'Foto do Local';
            $('#foto-modal .header').text('Foto - ' + tipo);
            $('#foto-modal-img').attr('src', url);
            fotoModalZoom = 1;
            fotoModalRotation = 0;
            fotoModalUrl = url;
            $('#foto-modal-img').css('transform', 'scale(1) rotate(0deg)')
              .attr('data-zoom', 1)
              .attr('data-rotation', 0);
            $('#foto-modal').modal({
              detachable: false,
              allowMultiple: true,
              onShow: function() {
                $(this).css('z-index', '1010');
              },
              onHide: function() {
                $(this).css('z-index', '');
                return true;
              }
            }).modal('show');
          });
        },
        error: function() {
          $('#fotos-local-content').html('<div class="ui negative message">Erro ao carregar fotos do local.</div>');
          $('#fotos-local-loader').hide();
          $('#fotos-local-content').show();
        }
      });
    });
  }
  
  // Integração com o sistema de navegação AJAX existente
  function enhancedLoadPage(url) {
    // Show loading indicator
    $('.main-content').html('<div class="ui active dimmer"><div class="ui text loader">Carregando...</div></div>');
    
    // Fetch the page content
    $.ajax({
      url: url,
      type: 'GET',
      success: function(response) {
        // Extract just the content part
        const content = $(response).find('.main-content').html();
        const title = $(response).filter('title').text();
        
        // Update the DOM
        $('.main-content').html(content);
        document.title = title;
        
        // Update active state in sidebar
        $('#sidebar .menu-item').removeClass('active');
        $('#sidebar a.menu-item[href="'+url+'"]').addClass('active');
        
        // Update browser URL without refresh
        history.pushState({url: url}, title, url);
        
        // Reinitialize components for the new page
        initializeCurrentPage();
      },
      error: function() {
        showNotification('Erro ao carregar página. Tentando recarregar...', 'negative');
        window.location = url; // Fallback to normal navigation
      }
    });
  }
  
  // Estado do zoom e rotação do modal de foto
  let fotoModalZoom = 1;
  let fotoModalRotation = 0;
  let fotoModalUrl = '';

  // Inicialização quando o DOM estiver pronto
  $(document).ready(function() {
    console.log('DOM carregado! Inicializando aplicação...');
    
    // Configurar tratadores de eventos globais uma única vez
    setupGlobalEventHandlers();
    
    // Inicializar a página atual
    initializeCurrentPage();
    
    // Substituir o carregamento de página existente pelo aprimorado
    window.loadPage = enhancedLoadPage;
    
    // AJAX Navigation for sidebar links
    $('#sidebar a.menu-item:not(.logout-item)').off('click').on('click', function(e) {
      // Skip if modifier keys are pressed (allow opening in new tab)
      if (e.ctrlKey || e.shiftKey || e.metaKey) return;
      
      e.preventDefault();
      const url = $(this).attr('href');
      enhancedLoadPage(url);
    });
    
    // Handle browser back/forward buttons
    $(window).off('popstate').on('popstate', function(e) {
      if (e.originalEvent.state && e.originalEvent.state.url) {
        enhancedLoadPage(e.originalEvent.state.url);
      }
    });
    
    // Ao abrir o modal, reseta zoom/rotação
    $(document).off('click', '.ver-foto-btn').on('click', '.ver-foto-btn', function(e) {
      e.preventDefault();
      const url = $(this).data('foto-url');
      const titulo = $(this).data('camera-titulo') || 'Foto da Câmera';
      const numeroSerie = $(this).data('camera-sn') || 'N/A';
      const header = `${titulo} (SN: ${numeroSerie})`;

      $('#foto-modal .header').text('Foto - ' + header);
      $('#foto-modal-img').attr('src', url);
      fotoModalZoom = 1;
      fotoModalRotation = 0;
      fotoModalUrl = url;
      $('#foto-modal-img').css('transform', 'scale(1) rotate(0deg)')
        .attr('data-zoom', 1)
        .attr('data-rotation', 0);

      $('#foto-modal').modal({
        detachable: false,
        allowMultiple: true,
        onShow: function() {
          $(this).css('z-index', '1010');
        },
        onHide: function() {
          $(this).css('z-index', '');
          return true;
        }
      }).modal('show');
    });

    // Botões de zoom/rotação no modal de foto
    $('#foto-modal').on('click', '.zoom-in-btn-modal', function() {
      fotoModalZoom = Math.min(fotoModalZoom + 0.2, 3);
      $('#foto-modal-img').css('transform', `scale(${fotoModalZoom}) rotate(${fotoModalRotation}deg)`)
        .attr('data-zoom', fotoModalZoom);
    });
    $('#foto-modal').on('click', '.zoom-out-btn-modal', function() {
      fotoModalZoom = Math.max(fotoModalZoom - 0.2, 0.5);
      $('#foto-modal-img').css('transform', `scale(${fotoModalZoom}) rotate(${fotoModalRotation}deg)`)
        .attr('data-zoom', fotoModalZoom);
    });
    $('#foto-modal').on('click', '.rotate-btn-modal', function() {
      fotoModalRotation = (fotoModalRotation + 90) % 360;
      $('#foto-modal-img').css('transform', `scale(${fotoModalZoom}) rotate(${fotoModalRotation}deg)`)
        .attr('data-rotation', fotoModalRotation);
    });
    
    console.log('Aplicação inicializada com sucesso!');
  });