import React from 'react';
import { createPortal } from 'react-dom';
import { Member, MemberCardSettings, OrganizationSetting } from '../../types';
import { MemberCardPreview } from './MemberCardPreview';

interface PrintCardContainerProps {
  member: Member;
  cardSettings: MemberCardSettings;
  orgSettings: OrganizationSetting;
  side: 'front' | 'back' | 'both';
  cardTheme?: 'dark' | 'light';
}

export const PrintCardContainer: React.FC<PrintCardContainerProps> = ({
  member,
  cardSettings,
  orgSettings,
  side,
  cardTheme = 'dark',
}) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div id="print-container" aria-hidden="true">
      {side === 'both' ? (
        <>
          <div className="print-a4-page">
            <MemberCardPreview
              member={member}
              cardSettings={cardSettings}
              orgSettings={orgSettings}
              side="front"
              cardTheme={cardTheme}
              isPrintVersion={true}
            />
          </div>
          <div className="print-a4-page">
            <MemberCardPreview
              member={member}
              cardSettings={cardSettings}
              orgSettings={orgSettings}
              side="back"
              cardTheme={cardTheme}
              isPrintVersion={true}
            />
          </div>
        </>
      ) : (
        <MemberCardPreview
          member={member}
          cardSettings={cardSettings}
          orgSettings={orgSettings}
          side={side}
          cardTheme={cardTheme}
          isPrintVersion={true}
        />
      )}
    </div>,
    document.body
  );
};
