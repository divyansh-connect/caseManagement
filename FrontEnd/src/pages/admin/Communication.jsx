import React from 'react';
import { CommunicationView } from '../../components/communication/CommunicationView';
import { INITIAL_CASES, INITIAL_MESSAGES } from '../../data/mockData';

export const AdminCommunication = () => {
  return <CommunicationView cases={INITIAL_CASES} messages={INITIAL_MESSAGES} />;
};
