import React from 'react';
import { CommunicationView } from '../../components/communication/CommunicationView';
import { useCase } from '../../context/CaseContext';

export const AdminCommunication = () => {
  const { cases } = useCase();
  return <CommunicationView cases={cases} messages={[]} />;
};

