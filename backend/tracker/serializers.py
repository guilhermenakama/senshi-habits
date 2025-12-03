from rest_framework import serializers
from .models import Habit, HabitLog, Workout, PersonalRecord, BodyMeasurement, LifeAssessment, JournalEntry, WorkoutTemplate, Exercise

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ['id', 'name', 'category', 'target_frequency', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']

class HabitLogSerializer(serializers.ModelSerializer):
    habit_name = serializers.ReadOnlyField(source='habit.name')

    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'habit_name', 'date', 'completed', 'value', 'user']
        read_only_fields = ['habit_name', 'user', 'date'] # User e date serão preenchidos pela View

class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = '__all__'
        read_only_fields = ['user']

class PersonalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalRecord
        fields = '__all__'
        read_only_fields = ['user']

class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = '__all__'
        read_only_fields = ['user']

class LifeAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeAssessment
        fields = '__all__'
        read_only_fields = ['user', 'date']

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'
        read_only_fields = ['user', 'date']

class WorkoutTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutTemplate
        fields = '__all__'
        read_only_fields = ['user']

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'