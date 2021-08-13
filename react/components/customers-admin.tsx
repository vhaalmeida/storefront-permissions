/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from 'react'
import React, { useState } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import { injectIntl, defineMessages } from 'react-intl'
import { useQuery, useMutation } from 'react-apollo'
import { Button, Dropdown, Toggle, Alert } from 'vtex.styleguide'

import GET_USER from '../queries/getUser.gql'
import GET_ROLES from '../queries/ListRoles.gql'
import SAVE_USER from '../mutations/saveUser.gql'

const messages = defineMessages({
  role: {
    id: 'admin/storefront-permissions.tab.roles.name.label',
    defaultMessage: 'Role',
  },
  canImpersonate: {
    id: 'admin/storefront-permissions.tab.users.canImpersonate.label',
    defaultMessage: 'Can impersonate',
  },
  name: {
    id: 'admin/storefront-permissions.tab.users.name.label',
    defaultMessage: 'Name',
  },
  email: {
    id: 'admin/storefront-permissions.tab.users.email.label',
    defaultMessage: 'Email',
  },
  required: {
    id: 'admin/storefront-permissions.required',
    defaultMessage: 'Required',
  },
  cancel: {
    id: 'admin/storefront-permissions.button.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'admin/storefront-permissions.button.save',
    defaultMessage: 'Save',
  },
  success: {
    id: 'admin/storefront-permissions.tab.users.success',
    defaultMessage: 'B2B info saved',
  },
  error: {
    id: 'admin/storefront-permissions.tab.users.error',
    defaultMessage: 'Error saving B2B info',
  },
})

const UserEdit: FC<any & WrappedComponentProps> = (props: any) => {
  const { intl, id, showName, showEmail, showCancel, onCancel, onSave } = props

  const [state, setState] = useState<any>({
    message: null,
    id: null,
    roleId: null,
    userId: null,
    clId: id,
    name: props.name ?? null,
    email: props.email ?? null,
    canImpersonate: false,
  })

  const { loading, data: getUserData } = useQuery(GET_USER, {
    skip: !id,
    variables: {
      id,
    },
    fetchPolicy: 'network-only',
    onCompleted: (res: any) => {
      setState({
        ...state,
        ...res.getUser,
      })
    },
  })

  const [saveUser, { loading: saveUserLoading }] = useMutation(SAVE_USER, {
    onCompleted(res: any) {
      if (onSave) {
        onSave()
      }

      setState({
        ...state,
        id: state.id ?? res?.saveUser?.id,
        message: 'success',
      })
    },

    onError: () => {
      setState({
        ...state,
        message: 'error',
      })
    },
  })

  const { loading: loadingRoles, data: dataRoles } = useQuery(GET_ROLES)

  const handleSaveUser = () => {
    const variables: any = {
      id: state.id,
      clId: state.clId,
      userId: state.userId,
      roleId: state.roleId,
      name: state.name,
      email: state.email,
      canImpersonate: state.canImpersonate,
    }

    if (state.id) {
      variables.id = state.id
    }

    saveUser({
      variables,
    })
  }

  return (
    <div className="w-100 pt6">
      {showName && <div className="mb5">{state.name}</div>}
      {showEmail && <div className="mb5">{state.email}</div>}
      <div className="mb5">
        <Dropdown
          label={intl.formatMessage(messages.role)}
          disabled={loadingRoles || loading}
          options={
            dataRoles?.listRoles?.map((role: any) => {
              return {
                value: role.id,
                label: role.name,
              }
            }) ?? []
          }
          value={state.roleId}
          onChange={(_: any, v: any) => {
            setState({ ...state, roleId: v })
          }}
        />
      </div>

      <div className="mb5">
        <Toggle
          label={intl.formatMessage(messages.canImpersonate)}
          size="large"
          checked={state.canImpersonate}
          onChange={() => {
            setState({ ...state, canImpersonate: !state.canImpersonate })
          }}
        />
      </div>

      <div className="mv4 flex justify-between">
        {showCancel && onCancel && (
          <Button
            variation="tertiary"
            disabled={loading}
            collapseLeft
            onClick={() => {
              onCancel()
            }}
          >
            {intl.formatMessage(messages.cancel)}
          </Button>
        )}
        <Button
          variation="primary"
          disabled={
            loading ||
            saveUserLoading ||
            !state.name ||
            !state.email ||
            !state.roleId
          }
          collapseRight
          onClick={() => {
            handleSaveUser()
          }}
        >
          {intl.formatMessage(messages.save)}
        </Button>
      </div>
      {state.message && (
        <Alert
          type={state.message}
          onClose={() => {
            setState({ ...state, message: null })
          }}
        >
          {state.message === 'success'
            ? intl.formatMessage(messages.success)
            : intl.formatMessage(messages.error)}
        </Alert>
      )}
    </div>
  )
}

export default injectIntl(UserEdit)