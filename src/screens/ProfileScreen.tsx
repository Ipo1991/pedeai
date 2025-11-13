import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Avatar, Card, Divider, Button, Modal, Portal, TextInput as PaperInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { getProfile, updateProfile, deleteProfile, changePassword } from '../api/api';
import SnackbarNotification from '../components/SnackbarNotification';

export default function ProfileScreen() {
  const auth = useContext(AuthContext)!;
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Máscaras iguais ao cadastro
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return 'Não informado';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatBirthDateDisplay = (birthDate: string) => {
    if (!birthDate) return 'Não informado';
    // Se vier no formato yyyy-MM-dd, converter para dd/MM/yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      const [year, month, day] = birthDate.split('-');
      return `${day}/${month}/${year}`;
    }
    return birthDate;
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      console.log('=== PROFILE DATA ===');
      console.log('Data completa:', data);
      console.log('birth_date:', data.birth_date);
      console.log('birthDate:', data.birthDate);
      setProfile(data);
      setEditName(data.name || '');
      setEditPhone(data.phone || '');
      setEditBirthDate(data.birthDate || ''); // backend retorna birthDate (camelCase)
    } catch (e) {
      console.error('Erro ao carregar perfil:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: editName,
        phone: editPhone,
        birth_date: editBirthDate, // snake_case para o backend
      };
      console.log('=== ENVIANDO PARA API ===');
      console.log('Payload:', payload);
      
      await updateProfile(payload);
      setEditModalVisible(false);
      loadProfile();
      setSnackbar({ visible: true, message: 'Perfil atualizado com sucesso!', type: 'success' });
      console.log('✅ Perfil atualizado com sucesso!');
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e.message || 'Erro ao atualizar perfil';
      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
      console.error('❌ Erro ao atualizar perfil:', errorMessage);
    }
  };

  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setSnackbar({ visible: true, message: 'Preencha todos os campos', type: 'warning' });
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setSnackbar({ visible: true, message: 'As novas senhas não coincidem', type: 'warning' });
      return;
    }
    
    if (newPassword.length < 8) {
      setSnackbar({ visible: true, message: 'A nova senha deve ter no mínimo 8 caracteres', type: 'warning' });
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSnackbar({ visible: true, message: 'Senha alterada com sucesso!', type: 'success' });
      console.log('✅ Senha alterada com sucesso!');
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e.message || 'Erro ao alterar senha';
      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
      console.error('❌ Erro ao alterar senha:', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const initials = profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <ScrollView style={styles.container}>
      {/* Header com Avatar */}
      <View style={styles.header}>
        <Avatar.Text size={80} label={initials} style={styles.avatar} color="#fff" />
        <Text style={styles.name}>{profile?.name || 'Usuário'}</Text>
        <Text style={styles.email}>{profile?.email || auth.user?.email}</Text>
        <Button
          mode="outlined"
          onPress={handleEditProfile}
          style={styles.editButton}
          textColor="#fff"
          icon="pencil"
        >
          Editar Perfil
        </Button>
      </View>

      {/* Informações Pessoais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>✉️ Email:</Text>
              <Text style={styles.infoValue}>{profile?.email || auth.user?.email}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>☎️ Telefone:</Text>
              <Text style={styles.infoValue}>{formatPhoneDisplay(profile?.phone)}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎂 Data de Nascimento:</Text>
              <Text style={styles.infoValue}>{formatBirthDateDisplay(profile?.birthDate)}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Segurança</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>🔑</Text>
            <Text style={styles.actionText}>Alterar Senha</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PedeAí © 2025</Text>
        <Text style={styles.footerText}>Versão 1.0.0</Text>
      </View>

      {/* Modal de Edição de Perfil */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderIcon}>📝</Text>
            <Text style={styles.modalHeaderTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} accessibilityLabel="Fechar">
              <Text style={styles.modalClose}>✖</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <PaperInput
              label="Nome"
              value={editName}
              onChangeText={setEditName}
              style={styles.modalInput}
              contentStyle={styles.modalInputContent}
              activeUnderlineColor="#b71c1c"
              textColor="#000"
              autoCapitalize="words"
              left={<PaperInput.Icon icon="account" color="#b71c1c" />}
            />
            
            <PaperInput
              label="Telefone"
              value={editPhone}
              onChangeText={(t) => setEditPhone(formatPhone(t))}
              style={styles.modalInput}
              contentStyle={styles.modalInputContent}
              activeUnderlineColor="#b71c1c"
              keyboardType="phone-pad"
              textColor="#000"
              placeholder="(99) 99999-9999"
              maxLength={15}
              left={<PaperInput.Icon icon="phone" color="#b71c1c" />}
            />
            
            <PaperInput
              label="Data de Nascimento"
              value={editBirthDate}
              onChangeText={(t) => setEditBirthDate(formatDate(t))}
              style={styles.modalInput}
              contentStyle={styles.modalInputContent}
              activeUnderlineColor="#b71c1c"
              placeholder="DD/MM/AAAA"
              keyboardType="number-pad"
              maxLength={10}
              textColor="#000"
              left={<PaperInput.Icon icon="calendar" color="#b71c1c" />}
            />
          </View>
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.modalButton}
              textColor="#b71c1c"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              style={styles.modalButton}
              buttonColor="#b71c1c"
            >
              Salvar
            </Button>
          </View>
        </Modal>

        {/* Modal de Alterar Senha */}
        <Modal
          visible={passwordModalVisible}
          onDismiss={() => setPasswordModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderIcon}>🔒</Text>
            <Text style={styles.modalHeaderTitle}>Alterar Senha</Text>
            <TouchableOpacity onPress={() => setPasswordModalVisible(false)} accessibilityLabel="Fechar">
              <Text style={styles.modalClose}>✖</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <PaperInput
              label="Senha Atual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.modalInput}
              contentStyle={styles.modalInputContent}
              activeUnderlineColor="#b71c1c"
              textColor="#000"
              secureTextEntry={!showCurrentPassword}
              left={<PaperInput.Icon icon="lock" color="#b71c1c" />}
              right={<PaperInput.Icon icon={showCurrentPassword ? 'eye-off' : 'eye'} onPress={() => setShowCurrentPassword(v => !v)} forceTextInputFocus={false} color="#b71c1c" />}
            />
            
            <PaperInput
              label="Nova Senha"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.modalInput}
              contentStyle={styles.modalInputContent}
              activeUnderlineColor="#b71c1c"
              textColor="#000"
              secureTextEntry={!showNewPassword}
              left={<PaperInput.Icon icon="lock-plus" color="#b71c1c" />}
              right={<PaperInput.Icon icon={showNewPassword ? 'eye-off' : 'eye'} onPress={() => setShowNewPassword(v => !v)} forceTextInputFocus={false} color="#b71c1c" />}
            />
            
            <PaperInput
              label="Confirmar Nova Senha"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              style={styles.modalInput}
              contentStyle={styles.modalInputContent}
              activeUnderlineColor="#b71c1c"
              textColor="#000"
              secureTextEntry={!showConfirmNewPassword}
              left={<PaperInput.Icon icon="lock-check" color="#b71c1c" />}
              right={<PaperInput.Icon icon={showConfirmNewPassword ? 'eye-off' : 'eye'} onPress={() => setShowConfirmNewPassword(v => !v)} forceTextInputFocus={false} color="#b71c1c" />}
            />
          </View>
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setPasswordModalVisible(false)}
              style={styles.modalButton}
              textColor="#b71c1c"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSavePassword}
              style={styles.modalButton}
              buttonColor="#b71c1c"
            >
              Salvar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar para feedback */}
      <SnackbarNotification
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#b71c1c',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  avatar: {
    backgroundColor: '#d32f2f',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#ffcdd2',
    marginBottom: 20,
  },
  editButton: {
    borderColor: '#fff',
    borderWidth: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#b71c1c',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
  // Modal v2 styles
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    // Android shadow
    elevation: 4,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffe5e5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcdd2',
  },
  modalHeaderIcon: {
    fontSize: 20,
    color: '#b71c1c',
    marginRight: 8,
  },
  modalHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#b71c1c',
  },
  modalClose: {
    color: '#b71c1c',
    fontSize: 18,
    paddingHorizontal: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalInput: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalInputContent: {
    backgroundColor: '#fff',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
