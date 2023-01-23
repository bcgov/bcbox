{{/*
Expand the name of the chart.
*/}}
{{- define "bcbox.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "bcbox.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" $name .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Define the config pattern of the chart based on options.
*/}}
{{- define "bcbox.configname" -}}
{{- if .Values.config.releaseScoped }}
{{- include "bcbox.fullname" . }}
{{- else }}
{{- include "bcbox.name" . }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "bcbox.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "bcbox.labels" -}}
helm.sh/chart: {{ include "bcbox.chart" . }}
app: {{ include "bcbox.fullname" . }}
{{ include "bcbox.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/component: backend
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ .Release.Name }}
app.openshift.io/runtime: nodejs
{{- end }}

{{/*
Selector labels
*/}}
{{- define "bcbox.selectorLabels" -}}
app.kubernetes.io/name: {{ include "bcbox.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "bcbox.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "bcbox.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
