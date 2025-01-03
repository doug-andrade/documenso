import { completeDocumentWithToken } from '@documenso/lib/server-only/document/complete-document-with-token';
import { rejectDocumentWithToken } from '@documenso/lib/server-only/document/reject-document-with-token';
import { setRecipientsForDocument } from '@documenso/lib/server-only/recipient/set-recipients-for-document';
import { setRecipientsForTemplate } from '@documenso/lib/server-only/recipient/set-recipients-for-template';
import { extractNextApiRequestMetadata } from '@documenso/lib/universal/extract-request-metadata';

import { authenticatedProcedure, procedure, router } from '../trpc';
import {
  ZAddSignersMutationSchema,
  ZAddTemplateSignersMutationSchema,
  ZCompleteDocumentWithTokenMutationSchema,
  ZRejectDocumentWithTokenMutationSchema,
} from './schema';

export const recipientRouter = router({
  addSigners: authenticatedProcedure
    .input(ZAddSignersMutationSchema)
    .mutation(async ({ input, ctx }) => {
      const { documentId, teamId, signers } = input;

      return await setRecipientsForDocument({
        userId: ctx.user.id,
        documentId,
        teamId,
        recipients: signers.map((signer) => ({
          id: signer.nativeId,
          email: signer.email,
          name: signer.name,
          role: signer.role,
          signingOrder: signer.signingOrder,
          actionAuth: signer.actionAuth,
        })),
        requestMetadata: extractNextApiRequestMetadata(ctx.req),
      });
    }),

  addTemplateSigners: authenticatedProcedure
    .input(ZAddTemplateSignersMutationSchema)
    .mutation(async ({ input, ctx }) => {
      const { templateId, signers, teamId } = input;

      return await setRecipientsForTemplate({
        userId: ctx.user.id,
        teamId,
        templateId,
        recipients: signers.map((signer) => ({
          id: signer.nativeId,
          email: signer.email,
          name: signer.name,
          role: signer.role,
          signingOrder: signer.signingOrder,
          actionAuth: signer.actionAuth,
        })),
      });
    }),

  completeDocumentWithToken: procedure
    .input(ZCompleteDocumentWithTokenMutationSchema)
    .mutation(async ({ input, ctx }) => {
      const { token, documentId, authOptions } = input;

      return await completeDocumentWithToken({
        token,
        documentId,
        authOptions,
        userId: ctx.user?.id,
        requestMetadata: extractNextApiRequestMetadata(ctx.req),
      });
    }),

  rejectDocumentWithToken: procedure
    .input(ZRejectDocumentWithTokenMutationSchema)
    .mutation(async ({ input, ctx }) => {
      const { token, documentId, reason } = input;

      return await rejectDocumentWithToken({
        token,
        documentId,
        reason,
        requestMetadata: extractNextApiRequestMetadata(ctx.req),
      });
    }),
});
