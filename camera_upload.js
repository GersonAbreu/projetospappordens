/**
 * Gerenciador de upload incremental de fotos
 */
const CameraUploader = {
    // Armazena o status de cada foto
    uploadStatus: {},
    
    // Função para inicializar o módulo
    init: function() {
        // BLOQUEAR o comportamento tradicional dos inputs file
        $(document).off('change', 'input[type="file"][name^="foto_camera_"]');
        
        // Detectar quando o usuário seleciona uma foto (APENAS para upload incremental)
        $(document).on('change', 'input[type="file"][name^="foto_camera_"]', function() {
            const $input = $(this);
            const cameraId = $input.attr('name').replace('foto_camera_', '');
            const ordemId = $('#finalizar-ordem-id').val();
            
            // Verificar se tem arquivo
            if (!this.files || !this.files[0]) {
                return;
            }
            
            // Referências aos elementos da UI
            const $cameraIcon = $input.siblings('.camera-icon-button');
            const $deleteButton = $input.siblings('.delete-photo-button');
            
            // Mostrar indicador de carregamento
            $cameraIcon.html('<i class="spinner loading icon"></i>');
            
            // Criar FormData para envio IMEDIATO
            const formData = new FormData();
            formData.append('ordem_id', ordemId);
            formData.append('camera_id', cameraId);
            formData.append('foto', this.files[0]);
            formData.append('csrfmiddlewaretoken', getCSRFToken());
            
            // Enviar a foto IMEDIATAMENTE
            $.ajax({
                url: '/ordens/upload-camera-foto/',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        // Marcar como concluído
                        $cameraIcon.html('<i class="check icon"></i>')
                            .removeClass('basic red green')
                            .addClass('green');
                        $deleteButton.show();
                        
                        // Armazenar status de upload
                        CameraUploader.uploadStatus[cameraId] = {
                            status: 'success',
                            url: response.foto_url
                        };
                        
                        // Atualizar contador
                        window.updatePhotoCounter && window.updatePhotoCounter();
                        
                        // Notificação sutil
                        if (typeof showNotification === 'function') {
                            showNotification(`Foto da câmera salva`, 'positive', 2000);
                        }
                        
                        // Atualiza fotosPorCamera global, se existir
                        if (typeof fotosPorCamera !== 'undefined') {
                            fotosPorCamera[cameraId] = { url: response.foto_url };
                        }
                    } else {
                        // Mostrar erro
                        $cameraIcon.html('<i class="exclamation triangle icon"></i>').removeClass('basic').addClass('red');
                        
                        // Armazenar status de erro
                        CameraUploader.uploadStatus[cameraId] = {
                            status: 'error',
                            message: response.message
                        };
                        
                        // Alerta
                        alert('Erro ao salvar foto: ' + response.message);
                    }
                },
                error: function() {
                    // Mostrar erro
                    $cameraIcon.html('<i class="exclamation triangle icon"></i>').removeClass('basic').addClass('red');
                    
                    // Armazenar status de erro
                    CameraUploader.uploadStatus[cameraId] = {
                        status: 'error',
                        message: 'Falha na conexão'
                    };
                    
                    // Permitir tentar novamente
                    alert('Erro de conexão. Tente novamente.');
                }
            });
        });
        
        // Quando o usuário clica no botão de excluir
        $(document).on('click', '.delete-photo-button', function() {
            const $button = $(this);
            const $input = $button.siblings('input[type="file"]');
            const cameraId = $input.attr('name').replace('foto_camera_', '');
            const ordemId = $('#finalizar-ordem-id').val();
            const fotoStatus = CameraUploader.uploadStatus[cameraId];
            
            // Se a foto já foi enviada para o servidor, precisamos excluí-la
            if (fotoStatus && fotoStatus.status === 'success') {
                // Mostrar indicador de carregamento
                $button.siblings('.camera-icon-button').html('<i class="spinner loading icon"></i>');
                
                // Enviar solicitação para excluir a foto no servidor
                $.ajax({
                    url: '/ordens/delete-camera-foto/',
                    type: 'POST',
                    data: {
                        'camera_id': cameraId,
                        'ordem_id': ordemId,
                        'csrfmiddlewaretoken': getCSRFToken()
                    },
                    success: function(response) {
                        if (response.success) {
                            // Limpar a UI
                            $input.val('');
                            $button.hide();
                            $button.siblings('.camera-icon-button').html('<i class="camera icon"></i>')
                                .removeClass('green red basic')
                                .addClass('basic');
                            
                            // Remover do status
                            delete CameraUploader.uploadStatus[cameraId];
                            
                            // Atualizar contador
                            window.updatePhotoCounter && window.updatePhotoCounter();
                            
                            // Chamar função do template se existir
                            if (typeof updatePhotoCounter === 'function') {
                                updatePhotoCounter();
                            }
                            
                            // Notificação sutil
                            if (typeof showNotification === 'function') {
                                showNotification(`Foto excluída`, 'positive', 2000);
                            }
                        } else {
                            // Mostrar erro, mas manter o status como erro
                            $button.siblings('.camera-icon-button').html('<i class="exclamation triangle icon"></i>').removeClass('basic').addClass('red');
                            alert('Erro ao excluir foto: ' + response.message);
                        }
                    },
                    error: function() {
                        // Mostrar erro, mas manter o status como erro
                        $button.siblings('.camera-icon-button').html('<i class="exclamation triangle icon"></i>').removeClass('basic').addClass('red');
                        alert('Erro de conexão ao excluir foto.');
                    }
                });
            } else {
                // Caso a foto não tenha sido enviada ou tenha dado erro no upload
                $input.val('');
                $button.hide();
                $button.siblings('.camera-icon-button').html('<i class="camera icon"></i>').removeClass('green red').addClass('basic');
                
                // Remover do status
                delete CameraUploader.uploadStatus[cameraId];
                
                // Atualizar contador
                window.updatePhotoCounter && window.updatePhotoCounter();
            }
        });
        
        // Intercepta o submit do formulário principal
        $('#finalizar-form').on('submit', function(e) {
            // Adicionar campo para indicar quais fotos já foram enviadas
            const uploadedPhotos = JSON.stringify(CameraUploader.uploadStatus);
            $('<input>').attr({
                type: 'hidden',
                name: 'uploaded_photos',
                value: uploadedPhotos
            }).appendTo($(this));
            
            // REMOVER todos os inputs file do form para evitar upload duplo
            $(this).find('input[type="file"][name^="foto_camera_"]').remove();
        });
    }
};

// Inicializar quando o documento estiver pronto
$(document).ready(function() {
    CameraUploader.init();
});